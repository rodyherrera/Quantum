import Dockerode from 'dockerode';
import path from 'path';
import slugify from 'slugify';
import PortBinding from '@models/portBinding';
import { Socket } from 'socket.io';
import { ensureDirectoryExists } from '@utilities/helpers';
import { createLogStream, setupSocketEvents } from '@services/logManager';
import { pullImage } from '@services/docker/image';
import { IDockerContainer, FileInfo, ExecResult } from '@typings/models/docker/container';
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

    async executeCommand(command: string[] | string, options: Partial<Dockerode.ExecOptions> = {}): Promise<ExecResult>{
        const container = await this.getExistingContainer();
    
        const cmd = typeof command === 'string' 
            ? ['sh', '-c', command]
            : command;

        const defaultOptions: Dockerode.ExecOptions = {
            Cmd: cmd,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            ...options
        };

        const exec = await container.exec(defaultOptions);
        const stream = await exec.start({ hijack: true });

        return new Promise<ExecResult>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const errorChunks: Buffer[] = [];
            
            stream.on('data', (chunk: Buffer) => {
                const data = chunk.slice(8);
                chunks.push(data);
            });

            stream.on('error', reject);

            stream.on('end', async () => {
                try{
                    const execInspect = await exec.inspect();
                    const output = Buffer.concat(chunks).toString('utf8').trim();
                    const error = Buffer.concat(errorChunks).toString('utf8').trim();
                    resolve({
                        output,
                        exitCode: execInspect.ExitCode,
                        error: error || undefined
                    });
                }catch(error){
                    reject(error);
                }
            });
        });
    };

    async installDefaultPackages(){
        try{
            await this.executeCommand('apk update');
            await this.executeCommand(`apk add ${process.env.DOCKER_APK_STARTER_PACKAGES}`);
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

    async writeFile(filePath: string, content: string): Promise<void> {
        try{
            await this.executeCommand(['sh', '-c', 'mkdir -p /tmp/quantum-file-operations']);
            
            const tempPath = '/tmp/quantum-file-operations/temp_file';
            const targetDir = path.dirname(filePath);

            await this.executeCommand([
                'sh',
                '-c',
                `printf '%s' "${content.replace(/"/g, '\\"')}" > ${tempPath}`
            ]);
            
            await this.executeCommand(['sh', '-c', `mkdir -p ${targetDir}`]);
            
            await this.executeCommand(['mv', tempPath, filePath]);
        }finally{
            try{
                await this.executeCommand(['rm', '-rf', '/tmp/quantum-file-operations']);
            }catch(error){
                logger.error(error);
            }
        }
    }

    async readFile(filePath: string): Promise<string> {
        const { output, exitCode, error } = await this.executeCommand(['cat', filePath]);
        
        if(exitCode !== 0){
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
        
        return output;
    }

    async listDirectory(dirPath: string = '/'): Promise<FileInfo[]>{
        const { output, exitCode, error } = await this.executeCommand(['ls', '-la', dirPath]);

        if(exitCode !== 0){
            throw new Error(`Failed to list directory ${dirPath}: ${error}`);
        }

        return this.parseLsOutput(output);
    }

    private parseLsOutput(output: string): FileInfo[]{
        const lines = output
            .split('\n')
            .filter(line => line.trim().length > 0)
            .filter(line => !line.startsWith('total'));
        return lines
            .map(line => {
                const match = line.match(/^([d\-])[\w-]+ +\d+ +\w+ +\w+ +\d+ +\w+ +\d+ +[\d:]+ +(.+)$/);
                if(!match || line.length < 10) return null;

                const name = match[2].trim();
                if(name === '.' || name === '..') return null;

                return {
                    name,
                    isDirectory: match[1] === 'd'
                };
            })
            .filter((file): file is FileInfo => 
                file !== null && 
                file.name !== '' && 
                file.name.length > 0
            );
    }

    async getContainerVolumes(): Promise<string[]> {
        if(!(this.container.volumes && this.container.volumes.length > 0)){
            return [];
        }
        const volumes: string[] = [];
        for(const { containerPath, mode } of this.container.volumes){
            const volumeName = `${this.container.dockerContainerName}-${slugify(containerPath)}`;
            try{
                // REMOVE RW FROM DB
                await docker.createVolume({
                    Name: volumeName,
                    Labels: {
                        container: this.container.dockerContainerName,
                    },
                });
            }catch(error: any){
                if(error.statusCode !== 409){
                    throw error;
                }
            }
            volumes.push(`${volumeName}:${containerPath}:${mode.trim()}`);
        }
        return volumes;
    }

    async getDockerOptions(){
        const dockerImage = await this.getDockerImage();
        const dockerNetwork = await this.getDockerNetwork();
        const networkName = getSystemNetworkName(this.container.user.toString(), dockerNetwork._id.toString());
        const { exposedPorts, bindings } = await this.getPortBindings();
        const volumeMounts: string[] = await this.getContainerVolumes();
        const binds = this.container.isRepositoryContainer ? [`${this.getDockerStoragePath()}:/app:rw`] : undefined;
        const environmentVariables = Array.from(this.container.environment.variables.entries()).map(
            ([key, value]) => `${key}=${value}`
        );

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
                Binds: binds,
                Mounts: volumeMounts.map((volume) => {
                    const [Source, Target, Mode] = volume.split(':');
                    return {
                        Source,
                        Target,
                        Type: 'volume',
                        ReadOnly: Mode === 'ro',
                    };
                }),
                NetworkMode: networkName,
                RestartPolicy: { Name: 'always' },
            },
        };

        return options;
    }
    
    async createContainer(): Promise<Dockerode.Container> {
        const options = await this.getDockerOptions();
        const container = await docker.createContainer(options);
        return container;
    }

    async reloadContainer(): Promise<void>{
        try{
            const containerName = this.container.dockerContainerName;
            const container = docker.getContainer(containerName);
            const containerInfo = await container.inspect();
            const isRunning = containerInfo.State.Running;
            if(isRunning){
                await container.stop({ t: 10 });
                logger.info(`@services/docker/container.ts (reloadContainer): Stopped container ${containerName} for environment update`);
            }

            const tempImageName = `temp-${containerName}-${Date.now()}`;
            await container.commit({ repo: tempImageName });
            logger.info(`@services/docker/container.ts (reloadContainer): Created temporary image of container ${containerName}`);
            const existingBinds = containerInfo.HostConfig.Binds || [];
            const existingVolumes = (containerInfo.Mounts || [])
                .filter((mount) => mount.Type === 'volume')
                .map((mount) => ({
                    Source: mount.Name,
                    Target: mount.Destination,
                    Type: 'volume',
                    ReadOnly: mount.RW === false
                }));
            await container.remove({ force: true, v: false });
            logger.info(`@services/docker/container.ts (reloadContainer): Removed old container ${containerName} without removing volumes`);

            const newOptions = await this.getDockerOptions();
            if(!newOptions.HostConfig.Binds && existingBinds.length > 0){
                newOptions.HostConfig.Binds = existingBinds;
            }

            if(!newOptions.HostConfig.Mounts && existingVolumes.length > 0){
                newOptions.HostConfig.Mounts = existingVolumes;
            }

            newOptions.Image = tempImageName;
            const newContainer = await docker.createContainer({
                ...newOptions,
                name: containerName
            });

            if(isRunning){
                await newContainer.start();
                await this.container.updateOne({ status: 'running' });
                logger.info(`@services/docker/container.ts (reloadContainer): Started recreated container ${containerName} with updated environment`);
            }else{
                await this.container.updateOne({ status: 'stopped' });
                logger.info(`@services/docker/container.ts (reloadContainer): Created container ${containerName} with updated environment (not started)`);
            }

            const tempImage = docker.getImage(tempImageName);
            await tempImage.remove({ force: true });
            logger.info(`@services/docker/container.ts (reloadContainer): Removed temporary image ${tempImageName}`);
            
            return newContainer;
        }catch(error){
            logger.error(`@services/docker/container.ts (reloadContainer): ${error}`);
            await this.container.updateOne({ status: 'error' });
            throw error;
        }
    }
    
    async removeContainer(){
        try{
            const container = docker.getContainer(this.container.dockerContainerName);
            const containerInfo = await container.inspect().catch((err) => {
                if(err.statusCode === 404){
                    return null;
                } 
                throw err;
            });
            if(containerInfo){
                await container.remove({ force: true });
            }
            if(this.container.volumes){
                for(const { containerPath } of this.container.volumes){
                    const volumeName = `${this.container.dockerContainerName}-${slugify(containerPath)}`;
                    try{
                        const volume = docker.getVolume(volumeName);
                        await volume.remove();
                    }catch(error: any){
                        if(error.statusCode !== 404){
                            logger.warn(
                                `@services/docker/container.ts (removeContainer): Could not remove volume ${volumeName}. Error: ${error}`
                            );
                        }
                    }
                }
            }
        }catch(error){
            logger.error('@services/docker/container.ts (removeContainer): ' + error);
        }
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
            await this.container.updateOne({ status: 'restarting' });
            await container.restart({ });
            logger.info(`@services/docker/container.ts (restartContainer): Stopped container ${this.container.dockerContainerName}.`);
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
                this.deployRepository();
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