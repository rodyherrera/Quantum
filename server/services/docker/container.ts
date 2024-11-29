import Dockerode from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import PortBinding from '@models/portBinding';
import { Socket } from 'socket.io';
import { existsSync } from 'fs';
import { ensureDirectoryExists } from '@utilities/helpers';
import { createLogStream, setupSocketEvents, shells } from '@services/logManager';
import { pullImage } from '@services/docker/image';
import { IDockerContainer } from '@typings/models/docker/container';
import { IDockerImage } from '@typings/models/docker/image';
import { IDockerNetwork } from '@typings/models/docker/network';
import { IPortBinding } from '@typings/models/portBinding';
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

export const createUserContainer = async (userId: string): Promise<IDockerContainer> => {
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
}

export const getSystemDockerName = (containerId: string): string => {
    const formattedName = containerId.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `quantum-container-${process.env.NODE_ENV}-${formattedName}`;
}

class DockerContainer{
    private container: IDockerContainer;
    private dockerImage: IDockerImage | null;
    private dockerNetwork: IDockerNetwork | null;

    constructor(container: IDockerContainer){
        this.container = container;
        this.dockerImage = null;
        this.dockerNetwork = null;
    }

    async getIpAddress(): Promise<string | null>{
        const container = await this.getExistingContainer();
        const network = await DockerNetwork.findById(this.container.network).select('dockerNetworkName');
        if(!network?.dockerNetworkName){
            return null;
        }
        const data = await container.inspect();
        const ipAddress = data.NetworkSettings.Networks[network.dockerNetworkName].IPAddress;
        return ipAddress;
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
                logger.error('@services/docker/container.ts (initializeContainer): Could not handle Docker container startup request: ' + error);
            }
        }
    }

    async startSocketShell(socket: Socket, workDir: string = '/app') {
        try{
            const container = await this.initializeContainer();
            if(!container) return;
            const exec = await container.exec({
                Cmd: [this.container.command],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: workDir,
                Tty: true
            });
            const id = this.container._id.toString();
            // TODO: check for storagePath usage
            await createLogStream(id, this.container.user.toString());
            setupSocketEvents(socket, id, this.container.user.toString(), exec);
        }catch(error){
            logger.info('@services/docker/container.ts (startSocketShell): ' + error);
        }
    }

    getDockerStoragePath(): string {
        if(!this.container.storagePath){
            throw Error('The container does not have a storage directory.');
        }
        return this.container.storagePath;
    }

    async removeContainer() {
        try{
            const container = docker.getContainer(this.container.dockerContainerName);
            if(!container) return;
            await container.remove({ force: true });
            const storagePath = this.getDockerStoragePath();
            if(existsSync(storagePath)){
                await fs.rm(this.getDockerStoragePath(), { recursive: true });
            }
        }catch (error){
            logger.error('@services/docker/container.ts (removeContainer): ' + error);
        }
    }

    async getExistingContainer(): Promise<Dockerode.Container> {
        const container = docker.getContainer(this.container.dockerContainerName);
        const { State } = await container.inspect();
        if(!State.Running) await container.start();
        return container;
    }

    async getDockerImage(): Promise<IDockerImage> {
        if(this.dockerImage) return this.dockerImage;
        const dockerImage = await DockerImage.findById(this.container.image).select('name tag');
        if(dockerImage === null){
            throw Error("Can't create a container that does not have any images configured.");
        }
        return dockerImage;
    }

    async getPortBindings(): Promise<any>{
        const portBindings = await PortBinding
            .find({ container: this.container._id })
            .select('internalPort externalPort protocol');
        const exposedPorts: any = {};
        const bindings: any = {};
        for(const { internalPort, protocol, externalPort } of portBindings){
            const key = `${internalPort}/${protocol}`;
            exposedPorts[key] = {};
            bindings[key] = [{ HostPort: `${externalPort}` }];
        }
        return { exposedPorts, bindings };
    };

    async getDockerNetwork(): Promise<IDockerNetwork> {
        if(this.dockerNetwork) return this.dockerNetwork;

        let dockerNetwork = await DockerNetwork.findById(this.container.network).select('name');
        if(dockerNetwork === null){
            throw Error('Trying to create a container that does not have any network configured yet.');
        }
        return dockerNetwork;
    }

    async createContainer(): Promise<Dockerode.Container> {
        const dockerImage = await this.getDockerImage();
        const dockerNetwork = await this.getDockerNetwork();
        const networkName = getSystemNetworkName(this.container.user.toString(), dockerNetwork._id.toString());
        const { exposedPorts, bindings } = await this.getPortBindings();
        const environmentVariables = Array.from(this.container.environment.variables.entries()).map(
            ([key, value]) => `${key}=${value}`);
            const options = {
                Image: `${dockerImage.name}:${dockerImage.tag}`,
                name: this.container.dockerContainerName,
                Tty: true,
                OpenStdin: true,
                StdinOnce: true,
                Env: environmentVariables,
                ExposedPorts: exposedPorts,
                HostConfig: {
                    PortBindings: bindings,
                    Binds: [`${this.getDockerStoragePath()}:/app:rw`],
                    NetworkMode: networkName,
                    RestartPolicy: { Name: 'always' }
                }
            };
            
        const container = await docker.createContainer(options);
        return container;
    }

    async recreateContainer(): Promise<any> {
        const container = docker.getContainer(this.container.dockerContainerName);
        if(container){
            await container.remove({ force: true });
        }
        shells.delete(this.container.user.toString());
        await this.initializeContainer();
    }

    async stop(): Promise<void>{
        try{
            const container = docker.getContainer(this.container.dockerContainerName);
            await container.stop();
            await this.container.updateOne({ status: 'stopped' });
            logger.info(`@services/docker/container.ts (stopContainer): Successfully stopped container ${this.container.dockerContainerName}.`);
        }catch(error){
            logger.error(`@services/docker/container.ts (stopContainer): Failed to stop container ${this.container.dockerContainerName}. Error: ${error}`);
            throw error;
        }
    }

    async restart(): Promise<void>{
        try{
            const container = docker.getContainer(this.container.dockerContainerName);
            logger.info(`@services/docker/container.ts (restartContainer): Restarting container ${this.container.dockerContainerName}...`);
            const { State } = await container.inspect();
            if(State.Running){
                await container.stop();
                logger.info(`@services/docker/container.ts (restartContainer): Stopped container ${this.container.dockerContainerName}.`);
            }
            await this.container.updateOne({ status: 'restarting' });
            await container.start();
            await this.container.updateOne({ status: 'running' });
            logger.info(`@services/docker/container.ts (restartContainer): Successfully restarted container ${this.container.dockerContainerName}.`);
        }catch(error){
            logger.error(`@services/docker/container.ts (restartContainer): Failed to restart container ${this.container.dockerContainerName}. Error: ${error}`);
            throw error;
        }
    }

    async start(): Promise<void>{
        try{
            const container = docker.getContainer(this.container.dockerContainerName);
            const { State } = await container.inspect();
            if(State.Running){
                logger.info(`@services/docker/container.ts (startContainer): Container ${this.container.dockerContainerName} is already running.`);
                return;
            }
            await container.start();
            await this.container.updateOne({ status: 'running' });
            logger.info(`@services/docker/container.ts (startContainer): Successfully started container ${this.container.dockerContainerName}.`);
        }catch(error){
            logger.error(`@services/docker/container.ts (startContainer): Failed to start container ${this.container.dockerContainerName}. Error: ${error}`);
            throw error;
        }
    }

    async createAndStartContainer(): Promise<Dockerode.Container | null> {
        try{
            const dockerImage = await this.getDockerImage();
            await pullImage(dockerImage.name, dockerImage.tag);
            await ensureDirectoryExists(this.getDockerStoragePath());
            const container = await this.createContainer();
            await container.start();
            await this.container.updateOne({ status: 'running' });
            return container;
        }catch(error){
            logger.error('@services/docker/container.ts (createAndStartContainer): ' + error);
            return null;
        }
    }
}

export default DockerContainer;