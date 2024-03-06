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

const Deployment = require('@models/deployment');
const ContainerLoggable = require('@utilities/containerLoggable');

/**
 * This class manages interactions with a specific repository within the Quantum Cloud platform.  
 * It handles repository deployment, shell interactions, and error logging. 
*/
class RepositoryHandler extends ContainerLoggable{
    /**
     * Creates a new RepositoryHandler instance.
     *
     * @param {Object} repository - The Mongoose model object representing the repository.
     * @param {Object} user - The Mongoose model object representing the user associated with the repository.
    */
    constructor(repository, user){
        super(repository._id, user._id);
        this.repository = repository;
        this.user = user;
        this.workingDir = `/app/github-repos/${repository._id}${repository.rootDirectory}`;
    };

    /**
     * Stops and removes the interactive shell associated with the repository.
     * Used during cleanup or when the container is no longer needed.
     *
     * @returns {Promise<void>}
    */
    async stopAndRemoveShell(){
        try{
            const userContainers = global.userContainers[this.user._id];
            if(userContainers && userContainers[this.repository._id]){
                const shellStream = userContainers[this.repository._id];
                shellStream.write('\x03');
                await shellStream.end();
                delete userContainers[this.repository._id];
            }
        } catch(error){
            this.criticalErrorHandler('stopAndRemoveShell', error);
        }
    };
    
    /**
     * Retrieves an existing interactive shell for the repository, or creates a new one if necessary.
     *
     * @returns {Promise<Object>} - A stream object representing the interactive shell.
    */
    async getOrCreateShell(){
        try{
            const userContainers = global.userContainers[this.user._id];
            if(userContainers?.[this.repository._id]){
                return userContainers[this.repository._id];
            }
            const exec = await userContainers.instance.exec({
                Cmd: ['/bin/ash'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: this.workingDir,
                Tty: true
            });
            const stream = await exec.start({ hijack: true, stdin: true });
            userContainers[this.repository._id] = stream;
            return stream;
        }catch(error){
            this.criticalErrorHandler('createShell', error);
        }
    };

    /**
     * Marks the repository as inactive by removing it from runtime management (stopping shell and deleting associated data).
     *
     * @returns {Promise<void>}
    */
    async removeFromRuntime(){
        this.stopAndRemoveShell();
        delete global.userContainers[this.user._id][this.repository._id];
    };

    /**
     * Handles interactive shell sessions initiated through a socket connection.
     * Forwards user input to the shell and sends shell output back to the client.
     *
     * @param {Object} socket - Socket.io connection to the client.
     * @returns {Promise<void>}
    */
    async executeInteractiveShell(socket){
        while(!global.userContainers[this.user._id]?.instance){
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        const repositoryShell = await this.getOrCreateShell();
        this.setupSocketEvents(socket, repositoryShell);
    };

    /**
     * Initiates the deployment process for the repository. Executes installation, build, and start commands within the repository's containerized environment.
     *
     * @param {Object} githubUtility - An instance of the `Github` class to interact with the GitHub API. 
     * @returns {Promise<void>} - Resolves when the deployment process completes or an error occurs.
    */
    async start(githubUtility){
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
            console.log(error);
        }
    };

    /**
     * Filters repository commands, returning only valid (non-empty) commands.
     *
     * @returns {Array<string>} - An array of installation, build, and start commands.
    */
    getValidCommands(){
        const { buildCommand, installCommand, startCommand } = this.repository;
        return [installCommand, buildCommand, startCommand].filter(Boolean);
    };

    /**
     * Retrieves the most recent deployment record for the repository.
     *
     * @returns {Promise<Deployment>} - The Deployment object representing the most recent deployment.
    */
    async getCurrentDeployment(){
        const currentDeploymentId = this.repository.deployments.slice(-1)[0]
        return await Deployment
            .findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
    };

    /**
     * Executes a series of commands within the repository's interactive shell.
     *
     * @param {Array<string>} commands - An array of commands to execute.
     * @param {string} formattedEnvironment - Environment variables formatted for shell execution.
     * @param {Object} repositoryShell - Stream object representing the interactive shell.
    */
    executeCommands(commands, formattedEnvironment, repositoryShell){
        for(const command of commands){
            const formattedCommand = `${formattedEnvironment} ${command}\r\n`;
            repositoryShell.write(formattedCommand);
        }
    };

    /**
     * Logs critical errors encountered during the repository handling process.
     *
     * @param {string} method - The name of the method where the error occurred.
     * @param {Error} error - The error object.
    */
    handleCriticalError(method, error){
        console.log(`[Quantum Cloud] CRITICAL ERROR (at @utilities/repositoryHandler - ${method}):`, error);
        throw error;
    }
};

module.exports = RepositoryHandler;