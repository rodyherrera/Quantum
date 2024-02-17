const Docker = require('dockerode');

class UserContainer{
    constructor(user){
        this.docker = new Docker();
        this.user = user;
        this.user.dockerUserId = this.user._id.toString().replace(/[^a-zA-Z0-9_.-]/g, '_');
        this.instance = null;
    };

    async createContainer(){
        try{
            const existingContainer = this.docker.getContainer(this.user.dockerUserId);
            await existingContainer.inspect();
            global.userContainers[this.user.dockerUserId] = this;
            this.instance = existingContainer;
        }catch(error){
            if(error.statusCode === 404){
                this.instance = await this.docker.createContainer({
                    Image: 'ubuntu',
                    name: this.user.dockerUserId,
                    Tty: true,
                    Cmd: ['/bin/bash'],
                    HostConfig: {
                        Binds: [`${__dirname}/../storage/containers/${this.user._id}:/app:rw`]
                    }
                });
                console.log(this.user.dockerUserId);
                global.userContainers[this.user.dockerUserId] = this;
            }else{
                console.error('[Quantum Cloud] CRITICAL ERROR (at @utilities/userContainer - createContainer):', error);
                throw error;
            }
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
            let output = '';
            await new Promise((resolve, reject) => {
                stream.on('data', (data) => output += data.toString());
                stream.on('end', () => resolve());
                stream.on('error', (error) => reject(error));
            });
            return output;
        }catch(error){
            console.error('[Quantum Cloud] CRITICAL ERROR (at @utilities/userContainer - executeCommand):', error);
            throw error;
        }
    };
};

module.exports = UserContainer;