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
const DockerHandler = require('@utilities/dockerHandler');
const path = require('path');
const fs = require('fs').promises;

const docker = new Docker();

/**
 * Represents a user container within Quantum Cloud
 * Manages operations related to its life cycle and interaction.
*/
class UserContainer extends DockerHandler{
    constructor(user){
        const storagePath = path.join(__dirname, '../storage/containers', user._id.toString());
        super({
            storagePath,
            imageName: 'alpine:latest',
            dockerName: user._id.toString(),
            logName: user._id,
            userId: user._id
        });
        this.user = user;
        this.instance = null;
    };

    async remove(){
        try{
            await this.removeContainer();
            delete global.userContainers[this.user._id];
            console.log(`[Quantum Cloud]: Container ${this.dockerName} removed successfully.`);
        }catch(error){
            this.criticalErrorHandler('removeContainer', error);
        }
    };

    async start(){
        try{
            const existingContainer = await this.getExistingContainer();
            this.instance = existingContainer;
            global.userContainers[this.user._id] = this;
            await this.installPackages();
        }catch(error){
            if(error.statusCode === 404){
                this.instance = await this.createAndStartContainer();
                global.userContainers[this.user._id] = this;
                await this.installPackages()
            }else{
                this.criticalErrorHandler('startContainer', error);
            }
        }
    };
    
    async installPackages(){
        try{
            await this.executeCommand('apk update');
            await this.executeCommand(`apk add --no-cache ${process.env.DOCKER_APK_STARTER_PACKAGES}`);
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

    /**
     * Run an interactive terminal inside the container.
     * @param {SocketIO.Socket} 
     * @param {string} [workDir='/app'] Home directory
    */
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