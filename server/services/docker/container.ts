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
import { getSystemNetworkName } from '@services/docker/network';
import { IUser } from '@typings/models/user';
import { IRepository } from '@typings/models/repository';
import { IContainerStoragePath } from '@typings/services/dockerContainer';
import DockerImage from '@models/docker/image';
import logger from '@utilities/logger';
import DockerNetwork from '@models/docker/network';
import Repository from '@models/repository';
import RepositoryService from '@services/repositoryHandler';
import Github from '@services/github';

const docker = new Dockerode();

export const getContainerStoragePath = (userId: string, containerId: string, name: string): IContainerStoragePath => {
    const userContainerPath = path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', userId);
    const containerStoragePath = path.join(userContainerPath, 'docker-containers', `${slugify(name)}-${containerId}`);
    const repositoryContainerPath = path.join(userContainerPath, 'github-repos', `${slugify(name)}-${containerId}`);
    return { userContainerPath, containerStoragePath, repositoryContainerPath };
}

export const getSystemDockerName = (containerId: string): string => {
    const formattedName = containerId.replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `quantum-container-${process.env.NODE_ENV}-${formattedName}`;
}

class DockerContainer{
    private container: IDockerContainer;
    private repository: IRepository | null;
    private dockerImage: IDockerImage | null;
    private dockerNetwork: IDockerNetwork | null;

    constructor(container: IDockerContainer){
        this.container = container;
        this.dockerImage = null;
        this.dockerNetwork = null;
        this.repository = null;
    }

    async getRepository(){
        if(this.repository) return this.repository;
        this.repository = await Repository
            .findById(this.container.repository)
            .populate({
                path: 'user',
                select: 'username',
                populate: { path: 'github', select: 'accessToken username' }
            });
        return this.repository;
    }

    async deployRepository(){
        const repository = await this.getRepository();
        if(!repository) return;
        const repositoryService = new RepositoryService(repository);
        const githubService = new Github(repository.user as IUser, repository);
        await repositoryService.start(githubService);
    }

    async executeCommand(command: string, workDir: string = '/'): Promise<void> {
        const container = await this.getExistingContainer();
    
        // En lugar de lanzar solamente /bin/sh, concatena el comando con '-c' para ejecutarlo completamente.
        const exec = await container.exec({
            Cmd: ['/bin/sh', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
            WorkingDir: workDir,
            Tty: false,
        });
    
        // exec.start() retorna un stream; podemos “encadenar” la resolución de la Promesa en función de los eventos.
        const stream = await exec.start({ hijack: true });
    
        return new Promise<void>((resolve, reject) => {
            // Acumuladores de datos (si quisieras guardar logs o capturar salida).
            const stdoutChunks: Buffer[] = [];
            const stderrChunks: Buffer[] = [];
    
            stream.on('data', (chunk: Buffer) => {
                // Ojo: Dockerode a veces mezcla stdout y stderr en el mismo stream con prefijos,
                // pero por simplicidad asumimos que va llegando intercalado.
                stdoutChunks.push(chunk);
            });
    
            stream.on('error', (err: Error) => {
                reject(err);
            });
    
            stream.on('end', async () => {
                // Una vez que el stream termina, usamos exec.inspect() para ver exit code y estado final
                try {
                    const execInspect = await exec.inspect();
    
                    // Si exitCode es 0, se considera que el comando terminó OK
                    if (execInspect.ExitCode === 0) {
                        // Si quisieras obtener la salida, podrías hacer algo con stdoutChunks/stderrChunks aquí
                        resolve();
                    } else {
                        const stderrOutput = Buffer.concat(stderrChunks).toString();
                        reject(
                            new Error(
                                `Command "${command}" failed with exit code ${execInspect.ExitCode}. Stderr: ${stderrOutput}`
                            )
                        );
                    }
                } catch (inspectError) {
                    reject(inspectError);
                }
            });
        });
    }
    

    async installDefaultPackages(){
        try{
            await this.executeCommand('apk update');
            await this.executeCommand(`apk add --no-cache ${process.env.DOCKER_APK_STARTER_PACKAGES}`);
        }catch(error){
            logger.error('@services/docker/container.ts (installDefaultPackages): ' + error);
        }
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
            const userId = this.container.user.toString();
            const containerId = this.container._id.toString();
            await createLogStream(userId, containerId);
            setupSocketEvents(socket, userId, containerId, exec);
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
        await this.initializeContainer();
    }

    async stop(): Promise<void>{
        try{
            const container = docker.getContainer(this.container.dockerContainerName);
            await container.stop({ t: 0 });
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
            await container.stop({ t: 0 });
            logger.info(`@services/docker/container.ts (restartContainer): Stopped container ${this.container.dockerContainerName}.`);
            await this.container.updateOne({ status: 'restarting' });
            await container.start();
            if(this.container.isRepositoryContainer){
                await this.installDefaultPackages();
                await this.deployRepository();
            }
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
            if(this.container.isRepositoryContainer){
                await this.installDefaultPackages();
                await this.deployRepository();
            }
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
            if(this.container.isRepositoryContainer){
                await this.installDefaultPackages();
                await this.deployRepository();
            }
            await this.container.updateOne({ status: 'running' });
            return container;
        }catch(error){
            logger.error('@services/docker/container.ts (createAndStartContainer): ' + error);
            return null;
        }
    }
}

export default DockerContainer;