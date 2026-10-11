import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { In, Not } from 'typeorm';
import TemplateInstall from '@/modules/template/models/TemplateInstall';
import DockerContainer from '@/modules/docker/models/DockerContainer';
import DockerImage from '@/modules/docker/models/DockerImage';
import DockerNetwork from '@/modules/docker/models/DockerNetwork';
import PortBinding from '@/modules/docker/models/PortBinding';
import ActivityStepContext from '@/modules/activity/services/ActivityStepContext';
import { installInputs, installSpec, serviceEnvironment } from '@/modules/template/services/installEnvironment';
import { composeToSpec, interpolateCompose } from '@/modules/template/services/composeSpec';
import { TemplateInstallError } from '@/modules/template/contracts/domain/errors';
import { checkoutRepository } from '../build/SourceCheckout';
import { buildComposeImage, insideSource } from '../build/composeBuild';
import { getDockerHost } from '../DockerHost';
import { shellSplit } from '../shellSplit';
import ContainerOps from '../ContainerOps';
import { materializeNetwork, teardownNetwork } from '../NetworkOps';
import { allocateHostPort } from '../PortAllocator';
import { getContainerStoragePath, getStackSourcePath, getSystemDockerName } from '../paths';
import { failureMessage } from '../failureMessage';
import { TemplateInstallStatus } from '@quantum/contracts/modules/template/domain';
import { NetworkDriver, PortBindingProtocol } from '@quantum/contracts/modules/docker/domain';
import { JobType } from '@quantum/contracts/modules/deployment/domain';
import { logger } from '@/shared/utils/Logger';
import type {
    TemplateInstallPort,
    TemplateInstallService as InstalledService,
    TemplateServiceSpec,
    TemplateSpec
} from '@quantum/contracts/modules/template/domain';
import type Job from '../../models/Job';

const ENGINE_IMAGE: Record<string, string> = {
    postgres: 'postgres:16-alpine',
    mysql: 'mysql:8',
    mariadb: 'mariadb:11',
    mongodb: 'mongo:7',
    redis: 'redis:7-alpine'
};

const splitImage = (ref: string): { name: string; tag: string } => {
    const slash = ref.lastIndexOf('/');
    const colon = ref.lastIndexOf(':');
    if(colon > slash) return { name: ref.slice(0, colon), tag: ref.slice(colon + 1) || 'latest' };
    return { name: ref, tag: 'latest' };
};

const orderServices = (spec: TemplateSpec): Array<[string, TemplateServiceSpec]> => {
    const services = spec.services ?? {};
    const ordered: Array<[string, TemplateServiceSpec]> = [];
    const done = new Set<string>();

    const visit = (name: string, trail: Set<string>): void => {
        const service = services[name];
        if(!service || done.has(name) || trail.has(name)) return;
        trail.add(name);
        for(const dependency of service.depends_on ?? []) visit(dependency, trail);
        done.add(name);
        ordered.push([name, service]);
    };

    for(const name of Object.keys(services)) visit(name, new Set());
    return ordered;
};

export default class TemplateHandler{
    async run(job: Job): Promise<void>{
        if(job.type === JobType.TemplateUninstall){
            await this.#uninstall(job);
            return;
        }

        const installId = job.templateInstallId ?? (job.payload.installId as number | undefined);
        if(installId === undefined) throw new Error('Template::Job::MissingInstallId');

        const install = await TemplateInstall.findOneBy({ id: installId });
        if(!install) throw new Error(`Template::Job::InstallNotFound::${installId}`);

        if(job.type === JobType.TemplateInstall){
            await this.#install(job, install);
            return;
        }
        throw new Error(`Template::Job::UnknownType::${job.type}`);
    }

    async #install(job: Job, install: TemplateInstall): Promise<void>{
        const inputs = installInputs(install);
        const userId = install.userId ?? job.userId ?? 0;
        const organizationId = install.organizationId ?? 0;
        const activity = new ActivityStepContext({
            organizationId: install.organizationId,
            userId: job.userId ?? install.userId,
            scope: 'template',
            source: 'orchestrator.template',
            correlationId: String(job.id),
            meta: { templateInstallId: install.id }
        });

        install.status = TemplateInstallStatus.Provisioning;
        await install.save();

        try{
            const { spec, built } = await this.#resolveSpec(install, userId, activity);

            const network = await activity.step('Preparing the network', () => this.#network(install, userId, organizationId));
            install.networkId = network.id;
            await install.save();

            const services: InstalledService[] = [...install.services];

            for(const [name, service] of orderServices(spec)){
                const ref = built.get(name) ?? service.image ?? (service.engine !== undefined ? ENGINE_IMAGE[service.engine] : undefined);
                if(ref === undefined) throw new Error(`Template::Service::ImageRequired::${name}`);

                const previous = services.find((entry) => entry.name === name);
                const entry = await activity.step(`Starting ${name} (${ref})`, () =>
                    this.#service(install, name, service, ref, built.has(name), inputs, userId, organizationId, network, previous));

                const index = services.findIndex((current) => current.name === name);
                if(index >= 0) services[index] = entry;
                else services.push(entry);

                install.services = services;
                await install.save();
            }

            const wanted = new Set(Object.keys(spec.services ?? {}));
            for(const stale of services.filter((service) => !wanted.has(service.name))){
                await activity.step(`Removing ${stale.name}`, () => this.#teardownService(stale));
            }
            install.services = services.filter((service) => wanted.has(service.name));
            await install.save();

            install.status = TemplateInstallStatus.Running;
            await install.save();

            const app = services.find((service) => service.kind === 'app') ?? services[0];
            const port = app?.ports[0]?.externalPort;
            await activity.success(port !== undefined ? `${install.name} is up on port ${port}` : `${install.name} is up`);
            logger.info(`template install ${install.id} (${install.name}) running`, { scope: 'orchestrator.handler.template' });
        }catch(error){
            install.status = TemplateInstallStatus.Error;
            await install.save();
            await activity.fail('Install failed', failureMessage(error));
            throw error;
        }
    }

    async #network(install: TemplateInstall, userId: number, organizationId: number): Promise<DockerNetwork>{
        if(install.networkId !== null){
            const existing = await DockerNetwork.findOneBy({ id: install.networkId });
            if(existing) return existing;
        }

        const network = await DockerNetwork.create({
            name: `install-${install.id}`,
            dockerNetworkName: '',
            driver: NetworkDriver.Bridge,
            userId,
            organizationId
        }).save();

        network.dockerNetworkName = `quantum-network-${network.id}`;
        await network.save();
        await materializeNetwork(network);
        return network;
    }

    async #resolveSpec(install: TemplateInstall, userId: number, activity: ActivityStepContext): Promise<{ spec: TemplateSpec; built: Map<string, string> }>{
        const built = new Map<string, string>();

        if(install.compose === null){
            const spec = await installSpec(install);
            if(!spec) throw new Error(`Template::Job::SpecNotFound::${install.id}`);
            return { spec, built };
        }

        let text = install.compose;
        let sourcePath: string | null = null;
        let composeDir = '.';
        let version = 'latest';

        const source = install.source;
        if(source !== null){
            const target = getStackSourcePath(userId, install.id);
            const checkout = await activity.step(`Fetching ${source.owner}/${source.repo}@${source.branch}`, () =>
                checkoutRepository(target, `https://github.com/${source.owner}/${source.repo}.git`, source.branch, userId));
            version = checkout.commit.slice(0, 12) || 'latest';
            sourcePath = target;
            composeDir = path.dirname(source.composePath);
            text = await readFile(insideSource(target, source.composePath), 'utf8')
                .catch(() => { throw TemplateInstallError.ComposeFileNotFound(source.composePath); });
            install.compose = text;
        }

        const spec = composeToSpec(interpolateCompose(text, installInputs(install)), { allowBuild: sourcePath !== null });
        install.spec = spec;
        await install.save();

        if(sourcePath !== null){
            const docker = getDockerHost(install.nodeId).client();
            const buildPath = sourcePath;
            await Promise.all(Object.entries(spec.services).flatMap(([name, service]) => {
                if(service.build === undefined) return [];
                const tag = `quantum-stack-${install.id}-${name}:${version}`;
                return [activity.step(`Building ${name}`, () =>
                    buildComposeImage(docker, buildPath, composeDir, service.build as NonNullable<typeof service.build>, tag)
                ).then(() => { built.set(name, tag); })];
            }));
        }

        return { spec, built };
    }

    async #service(
        install: TemplateInstall,
        name: string,
        spec: TemplateServiceSpec,
        ref: string,
        builtLocally: boolean,
        inputs: Record<string, string>,
        userId: number,
        organizationId: number,
        network: DockerNetwork,
        previous: InstalledService | undefined
    ): Promise<InstalledService>{
        const { name: imageName, tag } = splitImage(ref);
        const image = await this.#image(imageName, tag, userId, organizationId, builtLocally);

        const environment = serviceEnvironment(install, name, spec, inputs);

        const container = await this.#container(install, name, spec, environment, userId, organizationId, image.id, network.id, previous?.containerId ?? null);

        const targets = (spec.ports ?? []).map((port) => port.target);
        await PortBinding.delete(targets.length === 0
            ? { containerId: container.id }
            : { containerId: container.id, internalPort: Not(In(targets)) });

        const ports: TemplateInstallPort[] = [];
        for(const port of spec.ports ?? []){
            const binding = await this.#publish(container, port.target, port.protocol, userId, organizationId);
            ports.push({ internalPort: binding.internalPort, externalPort: binding.externalPort, protocol: binding.protocol });
        }

        const ops = new ContainerOps(container);
        await ops.destroyContainer();
        await ops.createAndStartContainer({
            cmd: spec.command !== undefined && spec.command.trim() !== '' ? shellSplit(spec.command) : undefined,
            aliases: [name]
        });

        return { name, kind: spec.kind ?? 'app', image: ref, containerId: container.id, ports, address: null };
    }

    async #image(name: string, tag: string, userId: number, organizationId: number, builtLocally: boolean): Promise<DockerImage>{
        const existing = await DockerImage.findOneBy({ name, tag, organizationId, userId });
        if(existing){
            if(existing.builtLocally !== builtLocally){
                existing.builtLocally = builtLocally;
                await existing.save();
            }
            return existing;
        }
        return DockerImage.create({ name, tag, userId, organizationId, builtLocally }).save();
    }

    async #container(
        install: TemplateInstall,
        name: string,
        spec: TemplateServiceSpec,
        environment: Record<string, string>,
        userId: number,
        organizationId: number,
        imageId: number,
        networkId: number,
        containerId: number | null
    ): Promise<DockerContainer>{
        const volumes = (spec.volumes ?? []).map((volume) => ({
            containerPath: volume.path,
            mode: volume.mode === 'ro' ? 'ro' as const : 'rw' as const
        }));

        const containerName = `install-${install.id}-${name}`;
        const existing = containerId !== null
            ? await DockerContainer.findOneBy({ id: containerId })
            : await DockerContainer.findOneBy({ organizationId, name: containerName });
        if(existing){
            existing.environmentVariables = environment;
            existing.volumes = volumes;
            existing.command = spec.command ?? null;
            existing.imageId = imageId;
            existing.networkId = networkId;
            existing.projectId = install.projectId;
            await existing.save();
            return existing;
        }

        const container = await DockerContainer.create({
            name: containerName,
            dockerContainerName: '',
            command: spec.command ?? null,
            userId,
            organizationId,
            projectId: install.projectId,
            networkId,
            imageId,
            isRepositoryContainer: false,
            environmentVariables: environment,
            volumes
        }).save();

        container.dockerContainerName = getSystemDockerName(container.id);
        container.storagePath = getContainerStoragePath(userId, container.id, `${install.name}-${name}`).containerStoragePath;
        await container.save();
        return container;
    }

    async #publish(
        container: DockerContainer,
        internalPort: number,
        protocol: string | undefined,
        userId: number,
        organizationId: number
    ): Promise<PortBinding>{
        const existing = await PortBinding.findOneBy({ containerId: container.id, internalPort });
        if(existing) return existing;

        return PortBinding.create({
            containerId: container.id,
            userId,
            organizationId,
            internalPort,
            externalPort: await allocateHostPort(),
            protocol: protocol?.toLowerCase() === 'udp' ? PortBindingProtocol.Udp : PortBindingProtocol.Tcp
        }).save();
    }

    async #uninstall(job: Job): Promise<void>{
        const services = (job.payload.services as InstalledService[] | undefined) ?? [];
        const networkId = job.payload.networkId as number | null | undefined;

        for(const service of services) await this.#teardownService(service);

        if(networkId !== undefined && networkId !== null){
            const network = await DockerNetwork.findOneBy({ id: networkId });
            if(network){
                await teardownNetwork(network).catch(() => undefined);
                await network.remove();
            }
        }

        logger.info(`template install ${job.templateInstallId ?? '?'} torn down (${services.length} services)`, { scope: 'orchestrator.handler.template' });
    }

    async #teardownService(service: InstalledService): Promise<void>{
        if(service.containerId === null) return;
        const container = await DockerContainer.findOneBy({ id: service.containerId });
        if(!container) return;

        await new ContainerOps(container).removeContainer().catch((error) =>
            logger.warn(`could not remove ${container.dockerContainerName} — ${failureMessage(error)}`,
                { scope: 'orchestrator.handler.template' }));
        await PortBinding.delete({ containerId: container.id });
        await container.remove();
    }
}
