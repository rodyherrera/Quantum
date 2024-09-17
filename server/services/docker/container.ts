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

import Docker from 'dockerode';
import fs from 'fs/promises';
import { Socket } from 'socket.io';
import { ensureDirectoryExists } from '@utilities/helpers';
import { createLogStream, setupSocketEvents } from '@services/logManager';
import { pullImage } from '@services/docker/image';
import logger from '@utilities/logger';
import Dockerode from 'dockerode';

const docker = new Docker();

class DockerHandler{
    private storagePath: string;
    private imageName: string;
    private dockerName: string;
    private imageTag: string;

    constructor({ storagePath, imageName, dockerName, imageTag = 'latest' }: 
        { storagePath: string; imageName: string; dockerName: string; imageTag: string }){
        this.storagePath = storagePath;
        this.imageTag = imageTag;
        this.imageName = imageName;
        this.dockerName = this.formatDockerName(dockerName);
    }

    async initializeContainer(){
        try{
            const container = await this.getExistingContainer();
            return container;
        }catch(error: any){
            if(error.statusCode === 404){
                const container = await this.createAndStartContainer();
                return container;
            }else{
                logger.error('Could not handle Docker container startup request: ' + error);
            }
        }
    }

    // DUPLICATED CODE @services/userContainer.ts
    async startSocketShell(socket: Socket, id: string, workDir: string = '/app'){
        try{
            const container = await this.initializeContainer();
            if(!container) return;
            const exec = await container.exec({
                Cmd: ['/bin/sh'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: workDir,
                Tty: true
            });
            // check for refactor (id, id)
            await createLogStream(id, id);
            // same 
            setupSocketEvents(socket, id, id, exec);
        }catch(error){
            logger.info('CRITICAL ERROR (at @services/dockerHandler - startSocketShell): ' + error);
        }
    }

    /**
     * Removes the container and its associated storage.
     */
    async removeContainer(){
        try{
            const existingContainer = docker.getContainer(this.dockerName);
            if(!existingContainer) return;
            await existingContainer.stop();
            await existingContainer.remove({ force: true });
            await fs.rm(this.storagePath, { recursive: true });
        }catch(error){
            logger.error('CRITICAL ERROR (@dockerHandler - remove):', error);
        }
    }

    /**
     * Gets an existing instance of the container, if applicable.
     * @returns {Promise<Container>} Returns a Docker container object.
     */
    async getExistingContainer(): Promise<Dockerode.Container>{
        const existingContainer = docker.getContainer(this.dockerName);
        const { State } = await existingContainer.inspect();
        if(!State.Running) await existingContainer.start();
        return existingContainer;
    }

    /**
     * Formats a docker name, replacing special characters for compatibility.
     * @param {string} name - The original docker name to format.
     * @returns {string} - The formatted docker name.
     */
    formatDockerName(name: string): string{
        const formattedName = name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        return `${process.env.DOCKERS_CONTAINER_ALIASES}-${formattedName}`;
    }

    /**
     * Creates a new Docker container instance.
     * @returns {Promise<Container>} Returns a Docker container object.
     */
    async createContainer(networkMode = 'host'): Promise<Dockerode.Container>{
        console.log(networkMode);
        return docker.createContainer({
            Image: this.imageName + ':' + this.imageTag,
            name: this.dockerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Cmd: ['/bin/sh'],
            HostConfig: {
                Binds: [`${this.storagePath}:/app:rw`],
                NetworkMode: networkMode,
                RestartPolicy: { Name: 'always' }
            }
        });
    }

    /**
     * Creates a new Docker container and starts it.
     * @returns {Promise<Container>} Returns a Docker container object.
     */
    async createAndStartContainer(networkMode = 'Quantum-Network-66e476942a01b96cc3febaab-net2wo2rk-name22221111'): Promise<Dockerode.Container | null>{
        try{
            // The image pull method does not download the image every 
            // time it is called. If it is already installed, it will return.
            await pullImage(this.imageName, this.imageTag);
            await ensureDirectoryExists(this.storagePath);
            const container = await this.createContainer(networkMode);
            await container.start();
            return container;
        }catch(error){
            logger.error('CRITICAL ERROR (@dockerHandler - createAndStartContainer): ' + error);
            return null;
        }
    }
}

export default DockerHandler;
