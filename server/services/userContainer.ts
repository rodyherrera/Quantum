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

import DockerContainerService from '@services/docker/container';
import logger from '@utilities/logger';
import { IUser } from '@typings/models/user';
import { Socket } from 'socket.io';
import { createLogStream, setupSocketEvents } from '@services/logManager';
import Dockerode from 'dockerode';
import { IDockerContainer } from '@typings/models/docker/container';

/**
 * Represents a user container within Quantum Cloud
 * Manages operations related to its life cycle and interaction.
 */
class UserContainer extends DockerContainerService{
    private user: IUser;
    public instance: Dockerode.Container | null;

    /**
     * Creates a new UserContainer instance.
     * 
     * @param user - The user object associated with the container.
     */
    constructor(user: IUser){
        const container = user.container as IDockerContainer;
        super(container);
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

    async start(){
        const container = await this.initializeContainer();
        if(!container){
            throw new Error("Unable to start the user's container.")
        }
        this.instance = container;
    }
    
    /**
     * Run an interactive terminal inside the container.
     * @param socket 
     * @param workDir Home directory
     */
    async executeInteractiveShell(socket: Socket, workDir: string = '/app'){
        try{
            await this.start();
            if(!this.instance) return;
            const container = this.user.container as IDockerContainer;
            const exec = await this.instance.exec({
                Cmd: ['/bin/sh'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: workDir,
                Tty: true
            });
            const userId = this.user._id.toString();
            const containerId = container._id.toString();
            await createLogStream(userId, containerId);
            setupSocketEvents(socket, userId, containerId, exec);
        }catch(error){
            this.criticalErrorHandler('executeInteractiveShell', error);
        }
    }

    criticalErrorHandler(operation: string, error: any){
        logger.error(`@services/userContainer.ts (${operation}): ${error}.`);
        throw error;
    }
}

export default UserContainer;