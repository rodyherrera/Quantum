const Docker = require('dockerode');
const fs = require('fs').promises;

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

    async checkIfImageExists(imageName){
        const image = this.docker.getImage(imageName);
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
        await new Promise((resolve, reject) => {
            this.docker.pull(imageName, (err, stream) => {
                if(err){
                    reject(err);
                }else{
                    this.docker.modem.followProgress(stream, (err) => {
                        if(err) reject(err);
                        else resolve();
                    });
                }
            });
        });
        console.log(`[Quantum Cloud]: Image "${imageName}" downloaded.`);
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
            const imageName = 'alpine:latest';
            const imageExists = await this.checkIfImageExists(imageName);
            if(!imageExists) await this.pullImage(imageName);
            const storagePath = `${__dirname}/../storage/containers/${this.user._id}`;
            await this.ensureDirectoryExists(storagePath);
            const container = await this.docker.createContainer({
                Image: imageName,
                name: this.dockerName,
                Tty: true,
                OpenStdin: true,
                StdinOnce: true,
                Cmd: ['/bin/ash'],
                HostConfig: { Binds: [`${storagePath}:/app:rw`] }
            });
            await container.start();
            this.instance = container;
            global.userContainers[this.user._id] = this;
            await this.installPackages();
        }catch(error){
            this.criticalErrorHandler('createContainer', error);
        }
    };

    async ensureDirectoryExists(directoryPath){
        try{
            await fs.access(directoryPath);
        }catch(error){
            if(error.code === 'ENOENT'){
                await fs.mkdir(directoryPath, { recursive: true });
            }else{
                throw error;
            }
        }
    };

    async executeCommand(command){
        try{
            const exec = await this.instance.exec({
                Cmd: ['/bin/ash', '-c', command],
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

    async installPackages(){
        try{
            // Install the required packages
            await this.executeCommand('apk update');
            await this.executeCommand('apk add --no-cache git docker nodejs npm python3');
        }catch(error){
            this.criticalErrorHandler('installPackages', error);
        }
    };

    criticalErrorHandler(operation, error){
        console.error(`[Quantum Cloud] CRITICAL ERROR (at @utilities/userContainer - ${operation}):`, error);
        throw error;
    };
};

module.exports = UserContainer;