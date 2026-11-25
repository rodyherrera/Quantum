import Dockerode from 'dockerode';
import { getDockerHost } from './DockerHost';
import ContainerOptionsResolver from './ContainerOptionsResolver';
import DockerContainer from '@/modules/docker/models/DockerContainer';
import DockerImage from '@/modules/docker/models/DockerImage';
import Repository from '@/modules/repository/models/Repository';
import { internalHostname } from '@/modules/docker/services/containerAddress';
import { namedVolume } from '@/modules/docker/services/containerVolume';
import { containerEnvironment } from './containerEnvironment';
import { joinOrganizationNetwork, organizationNetworkName } from './NetworkOps';
import { ensureEdge, hostPortsOf, removeEdge } from './Edge';
import PortBinding from '@/modules/docker/models/PortBinding';
import { pullImage } from './pullImage';
import { ContainerStatus } from '@quantum/contracts/modules/docker/domain';
import { logger } from '@/shared/utils/Logger';

export interface ContainerOverrides{
    name?: string;
    imageOverride?: string;
    extraEnv?: string[];
    cmd?: string[];
    aliases?: string[];
    user?: string;
}

export interface ExecResult{
    output: string;
    exitCode: number;
    error?: string;
}

const APP_PID_FILE = '/app/.quantum/app.pid';

export const relaunchScript = (startCommand: string): string => [
    `mkdir -p "$(dirname ${APP_PID_FILE})"`,
    `if [ -f ${APP_PID_FILE} ]; then kill -TERM -"$(cat ${APP_PID_FILE})" 2>/dev/null || true; fi`,
    `setsid sh -c 'exec ${startCommand} >> /proc/1/fd/1 2>&1' &`,
    `echo $! > ${APP_PID_FILE}`
].join('\n');

export default class ContainerOps{
    #docker: Dockerode;

    constructor(private container: DockerContainer){
        this.#docker = getDockerHost().client();
    }

    async stop(): Promise<void>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        await live.stop({ t: 10 });
        this.container.status = ContainerStatus.Stopped;
        this.container.stoppedAt = new Date();
        this.container.ipAddress = '';
        await this.container.save();
        logger.info(`stopped container ${this.container.dockerContainerName}`, { scope: 'orchestrator.container' });
    }

    async start(): Promise<void>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        const { State } = await live.inspect();
        if(!State.Running) await live.start();
        await this.#join(this.container.dockerContainerName);
        await this.#markRunning(live);
        logger.info(`started container ${this.container.dockerContainerName}`, { scope: 'orchestrator.container' });
    }

    async restart(): Promise<void>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        this.container.status = ContainerStatus.Restarting;
        await this.container.save();
        await live.restart({ t: 10 });
        await this.#join(this.container.dockerContainerName);
        await this.#markRunning(live);
        logger.info(`restarted container ${this.container.dockerContainerName}`, { scope: 'orchestrator.container' });
    }

    async ensureAddress(): Promise<void>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        await this.#join(this.container.dockerContainerName);

        const ip = await this.#addressOf(live);
        if(ip === this.container.ipAddress) return;
        this.container.ipAddress = ip;
        await this.container.save();
    }

    async publishedPorts(): Promise<Set<number>>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        const info = await live.inspect().catch((error: { statusCode?: number }) =>
            error.statusCode === 404 ? null : Promise.reject(error));
        return info ? hostPortsOf(info) : new Set();
    }

    async removeContainer(): Promise<void>{
        await this.destroyContainer();
        if(this.container.isRepositoryContainer) await removeEdge(this.container);
        await this.#removeVolumes();
    }

    async destroyContainer(): Promise<void>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        const info = await live.inspect().catch((error: { statusCode?: number }) =>
            error.statusCode === 404 ? null : Promise.reject(error));
        if(!info) return;

        await live.remove({ force: true }).catch((error: { statusCode?: number }) => {
            if(error.statusCode === 404) return;
            return Promise.reject(error);
        });
    }

    async executeCommand(command: string[] | string, options: Partial<Dockerode.ExecCreateOptions> = {}): Promise<ExecResult>{
        const live = this.#docker.getContainer(this.container.dockerContainerName);
        const cmd = typeof command === 'string' ? ['sh', '-c', command] : command;
        const exec = await live.exec({ Cmd: cmd, AttachStdout: true, AttachStderr: true, Tty: false, ...options });
        const stream = await exec.start({ hijack: true });
        return this.#collectExec(exec, stream);
    }

    async #collectExec(exec: Dockerode.Exec, stream: NodeJS.ReadableStream): Promise<ExecResult>{
        return new Promise<ExecResult>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const errorChunks: Buffer[] = [];
            stream.on('data', (chunk: Buffer) => {
                const data = chunk.slice(8);
                if(chunk[0] === 2) errorChunks.push(data);
                else chunks.push(data);
            });
            stream.on('error', reject);
            stream.on('end', async () => {
                try{
                    const inspect = await exec.inspect();
                    resolve({
                        output: Buffer.concat(chunks).toString('utf8').trim(),
                        exitCode: inspect.ExitCode ?? -1,
                        error: Buffer.concat(errorChunks).toString('utf8').trim() || undefined
                    });
                }catch(error){
                    reject(error);
                }
            });
        });
    }

    async createAndStartContainer(overrides: ContainerOverrides = {}): Promise<Dockerode.Container>{
        await this.#pullBaseImage(overrides.imageOverride);
        const options = await new ContainerOptionsResolver(this.container).resolve(overrides);
        const created = await this.#docker.createContainer(options);
        await this.#join(created.id);
        await created.start();
        await this.#markRunning(created);
        return created;
    }

    /* Starts a second container of this one under `name`, leaving the running one and its record alone. */
    async createRelease(name: string, image: string): Promise<void>{
        const options = await new ContainerOptionsResolver(this.container).resolve({ name, imageOverride: image });
        const created = await this.#docker.createContainer(options);
        await this.#join(created.id);
        await created.start();
    }

    async reloadContainer(overrides: ContainerOverrides = {}): Promise<void>{
        try{
            this.container.status = ContainerStatus.Reloading;
            await this.container.save();
            const live = this.#docker.getContainer(this.container.dockerContainerName);
            const info = await live.inspect();
            const wasRunning = info.State.Running;
            if(wasRunning) await live.stop({ t: 10 });

            const tempImage = `temp-${this.container.dockerContainerName}-${Date.now()}`;
            await live.commit({ repo: tempImage });
            try{
                await this.#recreate(live, info, tempImage, overrides);
            }finally{
                await this.#docker.getImage(tempImage).remove({ force: true }).catch(() => undefined);
            }
        }catch(error){
            this.container.status = ContainerStatus.Error;
            await this.container.save();
            throw error;
        }
    }

    async #recreate(
        live: Dockerode.Container,
        info: Dockerode.ContainerInspectInfo,
        tempImage: string,
        overrides: ContainerOverrides
    ): Promise<void>{
        const existingBinds = info.HostConfig.Binds || [];
        await live.remove({ force: true, v: false });
        const options = await new ContainerOptionsResolver(this.container).resolve(overrides);
        const hostConfig = options.HostConfig;
        if(hostConfig && !hostConfig.Binds && existingBinds.length > 0) hostConfig.Binds = existingBinds;
        options.Image = overrides.imageOverride || tempImage;

        const created = await this.#docker.createContainer(options);
        await this.#join(created.id);
        const wasRunning = info.State.Running;
        if(wasRunning){
            await created.start();
            await this.relaunchRepositoryApp();
        }
        await this.#markRunning(created);
        logger.info(`reloaded container ${this.container.dockerContainerName}`, { scope: 'orchestrator.container' });
    }

    async relaunchRepositoryApp(): Promise<void>{
        if(!this.container.isRepositoryContainer || !this.container.repositoryId) return;
        const repository = await Repository.findOneBy({ id: this.container.repositoryId });
        if(!repository || !repository.startCommand) return;
        const workingDir = '/app' + (repository.rootDirectory || '');
        const env = await containerEnvironment(this.container);

        this.executeCommand(['sh', '-c', relaunchScript(repository.startCommand)], { WorkingDir: workingDir, Env: env })
            .catch(() => undefined);
        logger.info(`re-launched start command for ${this.container.dockerContainerName}`, { scope: 'orchestrator.container' });
    }

    async #join(containerRef: string): Promise<void>{
        try{
            const alias = await this.#reachedThroughEdge(containerRef) ? undefined : internalHostname(this.container);
            await joinOrganizationNetwork(containerRef, this.container.organizationId, alias);
        }catch(error){
            logger.warn(
                `could not attach ${this.container.dockerContainerName} to its organization network — ${(error as Error).message}`,
                { scope: 'orchestrator.container' }
            );
        }
    }

    async #addressOf(live: Dockerode.Container): Promise<string>{
        const info = await live.inspect().catch(() => null);
        const endpoint = info?.NetworkSettings?.Networks?.[organizationNetworkName(this.container.organizationId)];
        return endpoint?.IPAddress ?? '';
    }

    async #markRunning(live: Dockerode.Container): Promise<void>{
        this.container.ipAddress = await this.#addressOf(live);
        this.container.status = ContainerStatus.Running;
        this.container.startedAt = new Date();
        await this.container.save();
        if(this.container.isRepositoryContainer) await ensureEdge(this.container);
    }

    /*
     * A repository app with published ports is reached through its edge, which also holds its hostname.
     * One from before edges still publishes its own ports, and keeps its hostname until its next release.
     */
    async #reachedThroughEdge(containerRef: string): Promise<boolean>{
        if(!this.container.isRepositoryContainer) return false;
        if((await PortBinding.countBy({ containerId: this.container.id })) === 0) return false;
        const info = await this.#docker.getContainer(containerRef).inspect().catch(() => null);
        return info === null || hostPortsOf(info).size === 0;
    }

    async #pullBaseImage(imageOverride?: string): Promise<void>{
        if(imageOverride) return;
        const built = await DockerImage.findOneBy({ id: this.container.imageId });
        if(built?.builtLocally) return;
        const image = await new ContainerOptionsResolver(this.container).resolve({});
        if(!image.Image) throw new Error('Container::Image::Required');
        await pullImage(this.#docker, image.Image, { organizationId: this.container.organizationId, userId: this.container.userId });
    }

    async #removeVolumes(): Promise<void>{
        for(const { containerPath, source } of this.container.volumes){
            if(source !== undefined) continue;
            const volumeName = namedVolume(this.container.dockerContainerName, containerPath);
            try{
                await this.#docker.getVolume(volumeName).remove();
            }catch(error){
                if((error as { statusCode?: number }).statusCode !== 404){
                    logger.warn(`could not remove volume ${volumeName}`, { scope: 'orchestrator.container' });
                }
            }
        }
    }
}
