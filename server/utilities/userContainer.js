const Docker = require('dockerode');

class UserContainer{
    constructor(user){
        this.docker = new Docker();
        this.user = user;
        this.dockerName = this.user._id.toString().replace(/[^a-zA-Z0-9_.-]/g, '_');
        this.instance = null;
    };

    async start(){
        try{
            const existingContainer = await this.getExistingContainer();
            this.instance = existingContainer;
        }catch(error){
            if(error.statusCode === 404){
                await this.createAndStartContainer();
            }else{
                this.criticalErrorHandler('startContainer', error);
            }
        }
    };

    async getExistingContainer(){
        const existingContainer = this.docker.getContainer(this.dockerName);
        const { State } = await existingContainer.inspect();
        if(!State.Running){
            await existingContainer.start();
        }
        return existingContainer;
    };

    async createAndStartContainer(){
        try{
            const container = await this.docker.createContainer({
                Image: 'node:latest',
                name: this.dockerName,
                Tty: true,
                Cmd: ['/bin/bash'],
                HostConfig: {
                    Binds: [`${__dirname}/../storage/containers/${this.user._id}:/app:rw`]
                }
            });
            await container.start();
            this.instance = container;
            global.userContainers[this.user._id] = this;
        }catch(error){
            this.criticalErrorHandler('createContainer', error);
        }
    };

    async executeCommand(command){
        try{
            const exec = await this.instance.exec({
                Cmd: ['bash', '-c', command],
                AttachStdout: true,
                AttachStderr: true
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
            stream.on('data', (data) => output += data.toString());
            stream.on('end', () => resolve(output));
            stream.on('error', (error) => reject(error));
        });
    };

    criticalErrorHandler(operation, error){
        console.error(`[Quantum Cloud] CRITICAL ERROR (at @utilities/userContainer - ${operation}):`, error);
        throw error;
    };
};

module.exports = UserContainer;