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

import DockerHandler from '@services/dockerHandler';
import path from 'path';
import logger from '@utilities/logger';
import { IUser } from '@typings/models/user';
import { Socket } from 'socket.io';
import { createLogStream, setupSocketEvents } from '@services/logManager';
import Dockerode from 'dockerode';

/**
 * Represents a user container within Quantum Cloud
 * Manages operations related to its life cycle and interaction.
 */
class UserContainer extends DockerHandler{
    private user: IUser;
    public instance: Dockerode.Container | null;

    /**
     * Creates a new UserContainer instance.
     * 
     * @param user - The user object associated with the container.
     */
    constructor(user: IUser){
        super({
            storagePath: path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', user._id.toString()),
            imageName: 'alpine:latest',
            dockerName: user._id.toString()
        });
        this.user = user;
        this.instance = null;
    }

    /**
     * Removes the user's container and associated resources.  
     */
    async remove(){
        try{
            await this.removeContainer();
        }catch(error){
            this.criticalErrorHandler('removeContainer', error);
        }
    }

    async start(installPkgs: boolean = true){
        try{
            const existingContainer = await this.getExistingContainer();
            this.instance = existingContainer;
            if(installPkgs) await this.installPackages();
        }catch(error: any){
            if(error.statusCode === 404){
                this.instance = await this.createAndStartContainer();
                await this.installPackages();
            }else{
                this.criticalErrorHandler('startContainer', error);
            }
        }
    }
    
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
    }

    /**
     * Executes a command within the container.
     * 
     * @param command - The command to execute.
     * @param workDir - Path to the working directory (optional).
     * @returns The command output.
     */
    async executeCommand(command: string, workDir: string = '/'): Promise<void>{
        try{
            await this.start(false);
            if(!this.instance) return;
            const exec = await this.instance.exec({
                Cmd: ['/bin/ash', '-c', command],
                AttachStdout: true,
                WorkingDir: workDir,
                AttachStderr: true,
                Tty: false
            });
            exec.start({ stdin: true, hijack: true });
        }catch(error){
            this.criticalErrorHandler('executeCommand', error);
        }
    }

    /**
     * Run an interactive terminal inside the container.
     * @param socket 
     * @param workDir Home directory
     */
    async executeInteractiveShell(socket: Socket, workDir: string = '/app'){
        try{
            await this.start(false);
            if(!this.instance) return;
            const exec = await this.instance.exec({
                Cmd: ['/bin/sh'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: workDir,
                Tty: true
            });
            const id = this.user._id.toString();
            await createLogStream(id, id);
            setupSocketEvents(socket, id, id, exec);
        }catch(error){
            this.criticalErrorHandler('executeInteractiveShell', error);
        }
    }

    criticalErrorHandler(operation: string, error: any){
        logger.error(`CRITICAL ERROR (at @services/userContainer - ${operation}): ` + error);
        throw error;
    }
}

export default UserContainer;