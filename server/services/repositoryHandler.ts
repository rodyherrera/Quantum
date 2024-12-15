import Deployment from '@models/deployment';
import logger from '@utilities/logger';
import mongoose from 'mongoose';
import { setupSocketEvents, createLogStream } from '@services/logManager';
import { IUser } from '@typings/models/user';
import { Socket } from 'socket.io';
import { shells } from '@services/logManager';
import { IRepository } from '@typings/models/repository';
import GithubService from '@services/github';
import DockerContainerService from '@services/docker/container';

class RepositoryHandler{
    private repository: IRepository;
    private repositoryId: string;
    private userId: string;
    private user: IUser;
    private workingDir: string;

    constructor(repository: IRepository, user: IUser){
        this.repository = repository;
        this.repositoryId = this.repository._id.toString();
        this.user = user;
        this.userId = this.user._id.toString();
        this.workingDir = `/app/github-repos/${repository._id}${repository.rootDirectory}`;
    }

    async executeInteractiveShell(socket: Socket): Promise<void>{
        const shell = await this.getShell();
        setupSocketEvents(socket, this.repositoryId, this.userId, shell);
    }

    async removeFromRuntime(): Promise<void>{
        try{
            const shell = shells.get(this.repositoryId);
            if(shell){
                shell.write('\x03');
                shell.end();
            }
            shells.delete(this.repositoryId);
        }catch(error){
            logger.error('@services/repositoryHandler.ts (removeFromRuntime): ' + error);
        }
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

    async getShell(): Promise<any>{
        const currentShell = shells.get(this.repositoryId);
        if(currentShell){
            return currentShell;
        }
        await createLogStream(this.repositoryId, this.userId);
        const userContainer = await mongoose.model('DockerContainer').findOne({
            _id: this.user.container,
            isUserContainer: true
        });
        const containerService = new DockerContainerService(userContainer);
        const container = await containerService.getExistingContainer();
        const exec = await container.exec({
            Cmd: ['/bin/sh'],
            AttachStdout: true,
            AttachStderr: true,
            AttachStdin: true,
            WorkingDir: this.workingDir,
            Tty: true
        });
        const shell = await exec.start({ Tty: true, stdin: true, hijack: true });
        shells.set(this.repositoryId, shell);
        return shell;
    }

    async start(githubService: GithubService): Promise<void>{
        try{
            const commands = this.getValidCommands();
            if(commands.length === 0) return;
            const deployment = await this.getCurrentDeployment();
            const environment = deployment.getFormattedEnvironment();
            const shell = await this.getShell();
            this.executeCommands(commands, environment, shell);
            const { githubDeploymentId } = deployment;
            await githubService.updateDeploymentStatus(githubDeploymentId, 'success');
            deployment.status = 'success';
            await deployment.save();
        }catch(error){
            logger.error('@services/repositoryHandler.ts (start): ' + error);
        }
    }

    executeCommands(commands: string[], formattedEnvironment: string, repositoryShell: any): void{
        for(const command of commands){
            const formattedCommand = `${formattedEnvironment} ${command}\r\n`;
            repositoryShell.write(formattedCommand);
        }
    }
}

export default RepositoryHandler;