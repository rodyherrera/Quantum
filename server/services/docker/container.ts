import Dockerode from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import { Socket } from 'socket.io';
import { ensureDirectoryExists } from '@utilities/helpers';
import { createLogStream, setupSocketEvents } from '@services/logManager';
import { pullImage } from '@services/docker/image';
import { IDockerContainer } from '@typings/models/docker/container';
import { IDockerImage } from '@typings/models/docker/image';
import { IDockerNetwork } from '@typings/models/docker/network';
import { getSystemNetworkName } from '@services/docker/network';
import { IContainerStoragePath } from '@typings/services/dockerContainer';
import DockerImage from '@models/docker/image';
import logger from '@utilities/logger';
import DockerContainerModel from '@models/docker/container';
import DockerNetwork from '@models/docker/network';

const docker = new Dockerode();

export const getContainerStoragePath = (userId: string, containerId: string, name: string): IContainerStoragePath => {
    const userContainerPath = path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', userId);
    const containerStoragePath = path.join(userContainerPath, 'docker-containers', `${slugify(name)}-${containerId}`);
    return { userContainerPath, containerStoragePath };
}

export const createUserContainer =  async (userId: string): Promise<IDockerContainer> => {
    const image = await DockerImage.create({ name: 'alpine', tag: 'latest', user: userId });
    const network = await DockerNetwork.create({ user: userId, driver: 'bridge', name: userId });
    const container = await DockerContainerModel.create({
        name: userId,
        user: userId,
        image: image._id,
        network: network._id,
        isUserContainer: true
    });
    return container;
};

class DockerContainer{
    private container: IDockerContainer;
    private dockerImage: IDockerImage | null;
    private dockerNetwork: IDockerNetwork | null;

    constructor(container: IDockerContainer){
        this.container = container;
        this.dockerImage = null;
        this.dockerNetwork = null;
    }

    async initializeContainer(){
        try{
            const container = await this.getExistingContainer();
            return container;
        }catch(error: any){
            if(error.statusCode === 404){
                const container = await this.createAndStartContainer();
                return container;
            }else{
                logger.error('Could not handle Docker container startup request: ' + error);
            }
        }
    }

    async startSocketShell(socket: Socket, workDir: string = '/app'){
        try{
            const container = await this.initializeContainer();
            if(!container) return;
            const exec = await container.exec({
                Cmd: ['/bin/sh'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: workDir,
                Tty: true
            });
            const id = this.container._id.toString();
            await createLogStream(id, id);
            setupSocketEvents(socket, id, id, exec);
        }catch(error){
            logger.info('CRITICAL ERROR (at @services/dockerHandler - startSocketShell): ' + error);
        }
    }

    getSystemDockerName(): string{
        if(!this.container.name){
            throw Error('The docker container does not have a name.');
        }
        const formattedName = this.container.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        return `${process.env.DOCKERS_CONTAINER_ALIASES}-${formattedName}`;
    }

    getDockerStoragePath(): string{
        if(!this.container.storagePath){
            throw Error('The container does not have a storage directory.');
        }
        return this.container.storagePath;
    }

    async removeContainer(){
        try{
            const container = docker.getContainer(this.getSystemDockerName());
            if(!container) return;
            await container.stop();
            await container.remove({ force: true });
            await fs.rm(this.getDockerStoragePath(), { recursive: true });
        }catch(error){
            logger.error('CRITICAL ERROR (@dockerHandler - remove): ' + error);
        }
    }

    async getExistingContainer(): Promise<Dockerode.Container>{
        const container = docker.getContainer(this.getSystemDockerName());
        const { State } = await container.inspect();
        if(!State.Running) await container.start();
        return container;
    }

    async getDockerImage(): Promise<IDockerImage>{
        if(this.dockerImage) return this.dockerImage;
        const dockerImage = await DockerImage.findById(this.container.image).select('name tag');
        if(dockerImage === null){
            throw Error("Can't create a container that does not have any images configured.");
        }
        return dockerImage;
    }

    async getDockerNetwork(): Promise<IDockerNetwork>{
        if(this.dockerNetwork) return this.dockerNetwork;

        let dockerNetwork = await DockerNetwork.findById(this.container.network).select('name');
        if(dockerNetwork === null){
            throw Error('Trying to create a container that does not have any network configured yet.');
        }
        return dockerNetwork;
    }

    async createContainer(): Promise<Dockerode.Container>{
        const dockerImage = await this.getDockerImage();
        const dockerNetwork = await this.getDockerNetwork();
        const networkName = getSystemNetworkName(this.container.user.toString(), dockerNetwork.name);
        const dockerName = this.getSystemDockerName();
        const options = {
            Image: `${dockerImage.name}:${dockerImage.tag}`,
            name: dockerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Cmd: ['/bin/sh'],
            HostConfig: {
                Binds: [`${this.getDockerStoragePath()}:/app:rw`],
                NetworkMode: networkName,
                RestartPolicy: { Name: 'always' }
            }
        };
        const container = await docker.createContainer(options);
        return container;
    }

    async createAndStartContainer(): Promise<Dockerode.Container | null>{
        try{
            const dockerImage = await this.getDockerImage();
            await pullImage(dockerImage.name, dockerImage.tag);
            await ensureDirectoryExists(this.getDockerStoragePath());
            const container = await this.createContainer();
            await container.start();
            return container;
        }catch(error){
            logger.error('CRITICAL ERROR (@dockerHandler - createAndStartContainer): ' + error);
            return null;
        }
    }
}

export default DockerContainer;