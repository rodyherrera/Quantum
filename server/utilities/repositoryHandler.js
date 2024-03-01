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

class RepositoryHandler extends ContainerLoggable{
    constructor(repository, user){
        super(repository._id, user._id);
        this.repository = repository;
        this.user = user;
        this.workingDir = `/app/github-repos/${repository._id}${repository.rootDirectory}`;
    };

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

    async removeFromRuntime(){
        this.stopAndRemoveShell();
        delete global.userContainers[this.user._id][this.repository._id];
    };

    async executeInteractiveShell(socket){
        while(!global.userContainers[this.user._id]?.instance){
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        const repositoryShell = await this.getOrCreateShell();
        this.setupSocketEvents(socket, repositoryShell);
    };

    async setupSocketEvents(socket, repositoryShell){
        socket.emit('history', await this.getLog());
        socket.on('command', (command) => {
            command = command + '\n';
            this.appendLog(command);
            repositoryShell.write(command);
        });
        repositoryShell.on('data', (chunk) => {
            chunk = chunk.toString('utf8');
            this.appendLog(chunk);
            socket.emit('response', chunk);
        });
    };

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

    getValidCommands(){
        const { buildCommand, installCommand, startCommand } = this.repository;
        return [installCommand, buildCommand, startCommand].filter(Boolean);
    };

    async getCurrentDeployment(){
        const currentDeploymentId = this.repository.deployments.slice(-1)[0]
        return await Deployment
            .findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
    };

    executeCommands(commands, formattedEnvironment, repositoryShell){
        for(const command of commands){
            const formattedCommand = `${formattedEnvironment} ${command}\r\n`;
            repositoryShell.write(formattedCommand);
        }
    };

    handleCriticalError(method, error){
        console.log(`[Quantum Cloud] CRITICAL ERROR (at @utilities/repositoryHandler - ${method}):`, error);
        throw error;
    }
};

module.exports = RepositoryHandler;