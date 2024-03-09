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

const DockerHandler = require('@utilities/dockerHandler');
const path = require('path');

/**
 * Represents a user container within Quantum Cloud
 * Manages operations related to its life cycle and interaction.
*/
class UserContainer extends DockerHandler{
    /**
     * Creates a new UserContainer instance.
     * 
     * @param {Object} user - The user object associated with the container.
    */
    constructor(user){
        super({
            storagePath: path.join('/var/lib/quantum', 'containers', user._id.toString()),
            imageName: 'alpine:latest',
            dockerName: user._id.toString(),
            logName: user._id,
            userId: user._id
        });
        this.user = user;
        this.instance = null;
    };

    /**
     * Removes the user's container and associated resources.  
    */
    async remove(){
        try{
            await this.removeContainer();
            // FOR FUTURE VERSIONS: Avoid storing containers globally (scalability)
            delete global.userContainers[this.user._id];
            console.log(`[Quantum Cloud]: Container ${this.dockerName} removed successfully.`);
        }catch(error){
            this.criticalErrorHandler('removeContainer', error);
        }
    };

    /**
     * Starts or creates the user's container and installs necessary packages.
    */
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
    
    /**
     * Installs the required packages in the container.
    */
    async installPackages(){
        try{
            await this.executeCommand('apk update');
            await this.executeCommand(`apk add --no-cache ${process.env.DOCKER_APK_STARTER_PACKAGES}`);
        }catch(error){
            this.criticalErrorHandler('installPackages', error);
        }
    };

    /**
     * Executes a command within the container.
     * 
     * @param {string} command - The command to execute.
     * @param {string} [workDir='/'] - Path to the working directory (optional).
     * @returns {Promise<string>} The command output.
    */
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

    /**
     * Collects and cleans the output of a container execution stream.
     * 
     * @param {Stream} stream - The execution stream. 
     * @returns {Promise<string>} The collected output
    */
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
            this.setupSocketEvents(socket, stream);
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