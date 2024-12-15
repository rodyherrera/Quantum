import Deployment from '@models/deployment';
import logger from '@utilities/logger';
import { IRepository } from '@typings/models/repository';
import GithubService from '@services/github';
import DockerContainerService from '@services/docker/container';
import DockerContainer from '@models/docker/container';
import { appendLog, createLogStream, shells } from '@services/logManager';
import { IDockerContainer } from '@typings/models/docker/container';

class RepositoryHandler{
    private repository: IRepository;
    private repositoryId: string;
    private container: IDockerContainer;

    constructor(repository: IRepository){
        this.repository = repository;
        this.repositoryId = this.repository._id.toString();
    }

    getValidCommands(): string[]{
        const { buildCommand, installCommand, startCommand } = this.repository;
        return [installCommand, buildCommand, startCommand].filter(Boolean) as string[];
    }

    async getCurrentDeployment(): Promise<any>{
        const currentDeploymentId = this.repository.deployments.slice(-1)[0]
        return await Deployment
            .findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
    }

    async getContainer(): Promise<IDockerContainer>{
        if(this.container) return this.container;
        this.container = await DockerContainer.findOne({ repository: this.repositoryId });
        return this.container;
    }

    async start(githubService: GithubService): Promise<void>{
        try{
            const commands = this.getValidCommands();
            if(commands.length === 0) return;
            const deployment = await this.getCurrentDeployment();
            const environment = deployment.getFormattedEnvironment();
            await this.deploy(commands, environment);
            const { githubDeploymentId } = deployment;
            await githubService.updateDeploymentStatus(githubDeploymentId, 'success');
            deployment.status = 'success';
            await deployment.save();
        }catch(error){
            logger.error('@services/repositoryHandler.ts (start): ' + error);
        }
    }
   
    private async waitForCommandCompletion(stream: NodeJS.ReadWriteStream): Promise<void>{
        return new Promise((resolve) => {
            let timer: NodeJS.Timeout;
            const onData = (chunk: Buffer) => {
                const output = chunk.toString('utf8');
                if(output.includes('$ ') || output.includes('# ')){
                    stream.removeListener('data', onData);
                    clearTimeout(timer);
                    resolve();
                }
            };

            timer = setTimeout(() => {
                stream.removeListener('data', onData);
                resolve();
            }, 5000);

            stream.on('data', onData);
        });
    }

    private async deploy(buildCommands: string[], environ: string): Promise<void>{
        const repositoryContainer = await this.getContainer();
        const containerService = new DockerContainerService(repositoryContainer);
        const container = await containerService.getExistingContainer();
        const userId = this.container.user.toString();
        const containerId = this.container._id.toString();
        const id = this.container.user.toString();
        let stream = shells.get(id);
        if(!stream){
            const exec = await container.exec({
                Cmd: [repositoryContainer.command],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: `/app/${this.repository.rootDirectory}`,
                Tty: true
            });
            stream = await exec.start({ hijack: true, stdin: true, Tty: true });
            await createLogStream(userId, containerId);
            shells.set(containerId, stream);
        }
        stream.on('data', (chunk: Buffer) => {
            const output = chunk.toString('utf8');
            appendLog(userId, containerId, output);
        });
        for(const command of buildCommands){
            const formattedCommand = `${environ} ${command}\n`;
            stream.write(formattedCommand);
            await this.waitForCommandCompletion(stream);
        }
    }
}

export default RepositoryHandler;