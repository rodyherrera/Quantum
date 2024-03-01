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
const fs = require('fs').promises;

class DockerHandler extends ContainerLoggable{
    constructor({ storagePath, imageName, dockerName, logName, userId }){
        super(logName, userId);
        this.storagePath = storagePath;
        this.imageName = imageName;
        this.dockerName = this.formatDockerName(dockerName);
    };

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
    };

    /**
     * Gets an existing instance of the container, if applicable.
     * @returns {Promise<Container>}
    */
    async getExistingContainer(){
        const existingContainer = docker.getContainer(this.dockerName);
        const { State } = await existingContainer.inspect();
        if(!State.Running) await existingContainer.start();
        return existingContainer;
    };

    formatDockerName(name){
        const formattedName = name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        return `${process.env.DOCKERS_CONTAINER_ALIASES}-${formattedName}`;
    };

    async createContainer(){
        return docker.createContainer({
            Image: this.imageName,
            name: this.dockerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Cmd: ['/bin/ash'],
            HostConfig: {
                Binds: [`${this.storagePath}:/app:rw`],
                // In future version, isolate the network.
                NetworkMode: 'host',
                RestartPolicy: { Name: 'no' }
            }
        });
    };

    async checkImageExists(){
        const image = docker.getImage(this.imageName);
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

    async pullImage(){
        try{
            console.log(`[Quantum Cloud]: Pulling "${this.imageName}"...`);
            await new Promise((resolve, reject) => {
                docker.pull(this.imageName, (error, stream) => {
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
    };

    async createAndStartContainer(){
        try{
            const imageExists = await this.checkImageExists();
            if(!imageExists) await this.pullImage();
            await this.ensureDirectoryExists(this.storagePath);
            const container = await this.createContainer();
            await container.start();
            return container;
        }catch(error){
            console.log('[Quantum Cloud] CRITICAL ERROR (@dockerHandler - createAndStartContainer):', error);
        }
    };
};

module.exports = DockerHandler;