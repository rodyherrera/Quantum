/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import Deployment from '@models/deployment';
import logger from '@utilities/logger';
import { setupSocketEvents, createLogStream } from '@services/logManager';
import { IUser } from '@typings/models/user';
import { Socket } from 'socket.io';
import { shells } from '@services/logManager';
import { IRepository } from '@typings/models/repository';
import UserContainer from './userContainer';

/**
 * This class manages interactions with a specific repository within the Quantum Cloud platform.  
 * It handles repository deployment, shell interactions, and error logging. 
*/
class RepositoryHandler{
    private repository: IRepository;
    private repositoryId: string;
    private user: IUser;
    private workingDir: string;

    /**
     * Creates a new RepositoryHandler instance.
     *
     * @param {Repository} repository - The Mongoose model object representing the repository.
     * @param {User} user - The Mongoose model object representing the user associated with the repository.
    */
    constructor(repository: IRepository, user: IUser){
        this.repository = repository;
        this.repositoryId = this.repository.id as string;
        this.user = user;
        this.workingDir = `/app/github-repos/${repository._id}${repository.rootDirectory}`;
    }

    /**
     * Retrieves an existing interactive shell for the repository, or creates a new one if necessary.
     *
     * @returns {Promise<Object>} - A stream object representing the interactive shell.
    */
    async getOrCreateShell(): Promise<any>{
        await createLogStream(this.repositoryId, this.user._id.toString());
        try{
            const shell = shells.get(this.repositoryId);
            if(shell) return shell;
            const populatedUser = await this.user.populate('container');
            const userContainer = new UserContainer(populatedUser);
            await userContainer.start();
            if(!userContainer.instance) return;
            const exec = await userContainer.instance.exec({
                Cmd: ['/bin/sh'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: this.workingDir,
                Tty: true
            });
            return exec;
        }catch(error){
            logger.error(error);
        }
    }

    /**
     * Marks the repository as inactive by removing it from runtime management (stopping shell and deleting associated data).
     *
     * @returns {Promise<void>}
    */
    async removeFromRuntime(): Promise<void>{
        try{
            const shell = shells.get(this.repositoryId);
            if(shell){
                shell.write('\x03');
                shell.end();
            }
            shells.delete(this.repositoryId);
        }catch(error){
            logger.error(error);
        }
    }

    /**
     * Handles interactive shell sessions initiated through a socket connection.
     * Forwards user input to the shell and sends shell output back to the client.
     *
     * @param {Socket} socket - Socket.io connection to the client.
     * @returns {Promise<void>}
    */
    async executeInteractiveShell(socket: Socket): Promise<void>{
        const repositoryShell = await this.getOrCreateShell();
        setupSocketEvents(socket, this.repositoryId, this.user._id.toString(), repositoryShell);
    }

    /**
     * Initiates the deployment process for the repository. Executes installation, build, and start commands within the repository's containerized environment.
     *
     * @param {GithubUtility} An instance of the `Github` class to interact with the GitHub API. 
     * @returns {Promise<void>} - Resolves when the deployment process completes or an error occurs.
    */
    async start(githubUtility: any): Promise<void>{
        try{
            const commands = this.getValidCommands();
            if(commands.length === 0) return;
            const deployment = await this.getCurrentDeployment();
            const formattedEnvironment = deployment.getFormattedEnvironment();
            const repositoryShell = await this.getOrCreateShell();
            this.executeCommands(commands, formattedEnvironment, repositoryShell);
            const { githubDeploymentId } = deployment;
            // TODO: IS USING THE FIRST DEP
            // TODO: SO, DELETE FROM GIT AND MONGODB!!
            await githubUtility.updateDeploymentStatus(githubDeploymentId, 'success');
            deployment.status = 'success';
            await deployment.save();
        }catch(error){
            logger.error(error);
        }
    }

    /**
     * Filters repository commands, returning only valid (non-empty) commands.
     *
     * @returns {Array<string>} - An array of installation, build, and start commands.
    */
    getValidCommands(): string[]{
        const { buildCommand, installCommand, startCommand } = this.repository;
        return [installCommand, buildCommand, startCommand].filter(Boolean) as string[];
    }

    /**
     * Retrieves the most recent deployment record for the repository.
     *
     * @returns {Promise<Deployment>} - The Deployment object representing the most recent deployment.
    */
    async getCurrentDeployment(): Promise<any>{
        const currentDeploymentId = this.repository.deployments.slice(-1)[0]
        return await Deployment
            .findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
    }

    /**
     * Executes a series of commands within the repository's interactive shell.
     *
     * @param {Array<string>} commands - An array of commands to execute.
     * @param {string} formattedEnvironment - Environment variables formatted for shell execution.
     * @param {Object} repositoryShell - Stream object representing the interactive shell.
    */
    executeCommands(commands: string[], formattedEnvironment: string, repositoryShell: any): void{
        for(const command of commands){
            const formattedCommand = `${formattedEnvironment} ${command}\r\n`;
            repositoryShell.write(formattedCommand);
        }
    }

    /**
     * Logs critical errors encountered during the repository handling process.
     *
     * @param {string} method - The name of the method where the error occurred.
     * @param {Error} error - The error object.
    */
    handleCriticalError(method: string, error: Error): void{
        logger.error(` CRITICAL ERROR (at @services/repositoryHandler - ${method}):`, error);
        throw error;
    }
}

export default RepositoryHandler;