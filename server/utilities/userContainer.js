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

const Docker = require('dockerode');
const ContainerLoggable = require('@utilities/containerLoggable');

const docker = new Docker();

class UserContainer extends ContainerLoggable{
    constructor(user){
        super(user._id, user._id);
        this.user = user;
        this.dockerName = this.getUserDockerName();
        this.instance = null;
    };

    getUserDockerName(){
        const userId = this.user._id.toString();
        const formattedUserId = userId.replace(/[^a-zA-Z0-9_.-]/g, '_');
        return process.env.DOCKERS_CONTAINER_ALIASES + '-' + formattedUserId;
    };

    async start(){
        try{
            const existingContainer = await this.getExistingContainer();
            this.instance = existingContainer;
            const containerInfo = await existingContainer.inspect();
            if(containerInfo.State.Running) await existingContainer.restart();
            global.userContainers[this.user._id] = this;
            await this.installPackages();
        }catch(error){
            if(error.statusCode === 404){
                await this.createAndStartContainer();
            }else{
                this.criticalErrorHandler('startContainer', error);
            }
        }
    };

    async getExistingContainer(){
        const existingContainer = docker.getContainer(this.dockerName);
        const { State } = await existingContainer.inspect();
        if(!State.Running) await existingContainer.start();
        return existingContainer;
    };

    async createContainer(imageName, storagePath){
        return docker.createContainer({
            Image: imageName,
            name: dockerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Cmd: ['/bin/ash'],
            HostConfig: { 
                Binds: [`${storagePath}:/app:rw`],
                // In future version, isolate the network.
                NetworkMode: 'host'
            }
        });
    };

    async installPackages(){
        try{
            await this.executeCommand('apk update');
            await this.executeCommand('apk add --no-cache git docker nodejs npm python3');
        }catch(error){
            this.criticalErrorHandler('installPackages', error);
        }
    };

    async executeCommand(command, workDir = '/'){
        try{
            const exec = await this.instance.exec({
                Cmd: ['/bin/ash', '-c', command],
                AttachStdout: true,
                WorkingDir: workDir,
                AttachStderr: true,
                Tty: true
            });
            const stream = await exec.start();
            return await this.collectStreamOutput(stream);
        }catch(error){
            this.criticalErrorHandler('executeCommand', error);
        }
    };

    async collectStreamOutput(stream){
        return new Promise((resolve, reject) => {
            let output = '';
            stream.on('data', (data) => {
                data = this.cleanOutput(data);
                output += data;
                this.appendLog(data);
            });
            stream.on('end', () => resolve(output));
            stream.on('error', (error) => reject(error));
        });
    };

    async checkIfImageExists(imageName){
        const image = docker.getImage(imageName);
        try{
            await image.inspect();
            return true;
        }catch(error){
            if(error.statusCode === 404){
                return false;
            }   
            throw error;
        }
    };

    async pullImage(imageName){
        console.log(`[Quantum Cloud]: Pulling "${imageName}"...`);
        try{
            await new Promise((resolve, reject) => {
                docker.pull(imageName, (error, stream) => {
                    if(error){
                        reject(error);
                    }else{
                        docker.modem.followProgress(stream, (fprogressError) => {
                            if(fprogressError) reject(fprogressError);
                            else resolve();
                        });
                    }
                });
            });
            console.log(`[Quantum Cloud]: Image "${imageName}" downloaded.`);
        }catch(error){
            console.error('Error pulling image:', error);
        }
    };

    async createAndStartContainer(){
        try{
            const imageName = 'alpine:latest';
            const imageExists = await this.checkIfImageExists(imageName);
            if(!imageExists) await this.pullImage(imageName);
            const storagePath = `${__dirname}/../storage/containers/${this.user._id}`;
            await this.ensureDirectoryExists(storagePath);
            const container = await this.createContainer(imageName, storagePath);
            await container.start();
            this.instance = container;
            global.userContainers[this.user._id] = this;
            await this.installPackages();
        }catch(error){
            this.criticalErrorHandler('createContainer', error);
        }
    };

    async executeInteractiveShell(socket, workDir = '/app'){
        try{
            const exec = await this.instance.exec({
                Cmd: ['/bin/ash'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: workDir,
                Tty: true
            });
            const stream = await exec.start({ hijack: true, stdin: true });
            socket.emit('history', await this.getLog());
            socket.on('command', (command) => stream.write(command + '\n'));
            stream.on('data', (chunk) => socket.emit('response', chunk.toString('utf8')));
        }catch(error){
            this.criticalErrorHandler('executeInteractiveShell', error);
        }
    };

    criticalErrorHandler(operation, error){
        console.error(`[Quantum Cloud] CRITICAL ERROR (at @utilities/userContainer - ${operation}):`, error);
        throw error;
    };
};

module.exports = UserContainer;