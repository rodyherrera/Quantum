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
import { ensureDirectoryExists } from '@utilities/runtime';
import { Container } from '@typings/services/dockerHandler';

const docker = new Docker();

class DockerHandler{
    private storagePath: string;
    private imageName: string;
    private dockerName: string;

    constructor({ storagePath, imageName, dockerName, logName, userId }: 
        { storagePath: string; imageName: string; dockerName: string; logName: string; userId: string }){
        this.storagePath = storagePath;
        this.imageName = imageName;
        this.dockerName = this.formatDockerName(dockerName);
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
            console.log('[Quantum Cloud] CRITICAL ERROR (@dockerHandler - remove):', error);
        }
    }

    /**
     * Gets an existing instance of the container, if applicable.
     * @returns {Promise<Container>} Returns a Docker container object.
     */
    async getExistingContainer(): Promise<Container>{
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
    async createContainer(): Promise<Container>{
        return docker.createContainer({
            Image: this.imageName,
            name: this.dockerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Cmd: ['/bin/ash'],
            HostConfig: {
                Binds: [`${this.storagePath}:/app:rw`],
                NetworkMode: 'host',
                RestartPolicy: { Name: 'no' }
            }
        });
    }

    /**
     * Checks if a Docker image exists locally.
     * @returns {Promise<boolean>} Returns true if the image exists, false otherwise.
     */
    async checkImageExists(): Promise<boolean>{
        const image = docker.getImage(this.imageName);
        try{
            await image.inspect();
            return true;
        }catch(error: any){
            if(error.statusCode === 404){
                return false;
            }
            throw error;
        }
    }

    /**
     * Pulls a Docker image from a remote repository.
     */
    async pullImage(){
        try{
            console.log(`[Quantum Cloud]: Pulling "${this.imageName}"...`);
            await new Promise<void>((resolve, reject) => {
                docker.pull(this.imageName, (error: any, stream: NodeJS.ReadableStream) => {
                    if(error) reject(error);
                    else{
                        docker.modem.followProgress(stream, (progressError) => {
                            if(progressError) reject(progressError);
                            else resolve();
                        });
                    }
                });
            });
            console.log(`[Quantum Cloud]: Image "${this.imageName}" downloaded.`);
        }catch(error){
            console.log('[Quantum Cloud] CRITICAL ERROR (@dockerHandler - pullImage):', error);
        }
    }

    /**
     * Creates a new Docker container and starts it.
     * @returns {Promise<Container>} Returns a Docker container object.
     */
    async createAndStartContainer(): Promise<Container | null>{
        try{
            const imageExists = await this.checkImageExists();
            if(!imageExists) await this.pullImage();
            await ensureDirectoryExists(this.storagePath);
            const container = await this.createContainer();
            await container.start();
            return container;
        }catch(error){
            console.log('[Quantum Cloud] CRITICAL ERROR (@dockerHandler - createAndStartContainer):', error);
            return null;
        }
    }
}

export default DockerHandler;