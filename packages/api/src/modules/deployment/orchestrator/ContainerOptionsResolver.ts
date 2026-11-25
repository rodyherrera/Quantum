import Dockerode from 'dockerode';
import { getDockerHost } from './DockerHost';
import DockerContainer from '@/modules/docker/models/DockerContainer';
import DockerImage from '@/modules/docker/models/DockerImage';
import { shellSplit } from './shellSplit';
import DockerNetwork from '@/modules/docker/models/DockerNetwork';
import PortBinding from '@/modules/docker/models/PortBinding';
import { namedVolume } from '@/modules/docker/services/containerVolume';
import { containerEnvironment } from './containerEnvironment';
import type { ContainerOverrides } from './ContainerOps';

export default class ContainerOptionsResolver{
    constructor(private container: DockerContainer){}

    async resolve(overrides: ContainerOverrides = {}): Promise<Dockerode.ContainerCreateOptions>{
        const image = await this.#imageRef(overrides.imageOverride);
        const networkName = await this.#networkName();
        const { exposedPorts, bindings } = await this.#portBindings();
        // A repository app's published ports belong to its edge, so a release can start next to it.
        const published = this.container.isRepositoryContainer ? {} : bindings;
        const mounts = await this.#volumeMounts();
        const binds = this.#binds();
        const env = [...(await containerEnvironment(this.container)), ...(overrides.extraEnv ?? [])];

        const options: Dockerode.ContainerCreateOptions = {
            Image: image,
            name: overrides.name ?? this.container.dockerContainerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Env: env,
            ExposedPorts: exposedPorts,
            HostConfig: {
                PortBindings: published,
                Binds: binds,
                Mounts: mounts,
                NetworkMode: networkName,
                RestartPolicy: { Name: 'always' }
            }
        };
        if(overrides.cmd !== undefined && overrides.cmd.length > 0) options.Cmd = [...overrides.cmd];
        else if(!this.container.isRepositoryContainer && this.container.command) options.Cmd = shellSplit(this.container.command);
        if(overrides.user !== undefined) options.User = overrides.user;
        if(overrides.aliases !== undefined && overrides.aliases.length > 0){
            options.NetworkingConfig = { EndpointsConfig: { [networkName]: { Aliases: [...overrides.aliases] } } };
        }
        return options;
    }

    async #imageRef(imageOverride?: string): Promise<string>{
        if(imageOverride) return imageOverride;
        const image = await DockerImage.findOneBy({ id: this.container.imageId });
        if(!image) throw new Error('Container::Image::NotFound');
        return `${image.name}:${image.tag}`;
    }

    async #networkName(): Promise<string>{
        const network = await DockerNetwork.findOneBy({ id: this.container.networkId });
        if(!network) throw new Error('Container::Network::NotFound');

        if(!network.dockerNetworkName) throw new Error('Container::Network::NotMaterialized');
        return network.dockerNetworkName;
    }

    async #portBindings(): Promise<{ exposedPorts: Record<string, object>; bindings: Record<string, Array<{ HostPort: string }>> }>{
        const portBindings = await PortBinding.find({ where: { containerId: this.container.id } });
        const exposedPorts: Record<string, object> = {};
        const bindings: Record<string, Array<{ HostPort: string }>> = {};
        for(const { internalPort, protocol, externalPort } of portBindings){
            const key = `${internalPort}/${protocol}`;
            exposedPorts[key] = {};
            bindings[key] = [{ HostPort: `${externalPort}` }];
        }
        return { exposedPorts, bindings };
    }

    async #volumeMounts(): Promise<Dockerode.MountSettings[]>{
        const docker = getDockerHost().client();
        const mounts: Dockerode.MountSettings[] = [];
        for(const { containerPath, mode, source } of this.container.volumes){
            if(source !== undefined && source.startsWith('/')){
                mounts.push({ Source: source, Target: containerPath, Type: 'bind', ReadOnly: mode === 'ro' });
                continue;
            }
            const volumeName = source ?? namedVolume(this.container.dockerContainerName, containerPath);
            await this.#ensureVolume(docker, volumeName);
            mounts.push({ Source: volumeName, Target: containerPath, Type: 'volume', ReadOnly: mode === 'ro' });
        }
        return mounts;
    }

    async #ensureVolume(docker: Dockerode, volumeName: string): Promise<void>{
        try{
            await docker.createVolume({ Name: volumeName, Labels: { container: this.container.dockerContainerName } });
        }catch(error){
            if((error as { statusCode?: number }).statusCode !== 409) throw error;
        }
    }

    #binds(): string[] | undefined{
        if(!this.container.isRepositoryContainer) return undefined;
        if(!this.container.storagePath) throw new Error('Container::StoragePath::Required');
        return [`${this.container.storagePath}:/app:rw`];
    }
}
