const Docker = require('dockerode');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);
const { createWriteStream, existsSync } = require('fs');

class UserContainer{
    constructor(user){
        this.docker = new Docker();
        this.user = user;
        this.dockerName = this.getUserDockerName();
        this.instance = null;
        this.logDir = this.getLogDirectory();
        this.logFile = `${this.logDir}/${this.user._id}.log`;
        this.logStream = this.createLogStream();
    };

    getUserDockerName(){
        const userId = this.user._id.toString();
        const formattedUserId = userId.replace(/[^a-zA-Z0-9_.-]/g, '_');
        return process.env.DOCKERS_CONTAINER_ALIASES + '-' + formattedUserId;
    };

    getLogDirectory(){
        const { _id } = this.user;
        return path.join(
            __dirname, '..', 'storage', 'containers', _id.toString(), 'logs');
    };
    
    async getLog(){
        try{
            if(!existsSync(this.logFile)) return '';
            const content = await fs.readFile(this.logFile);
            return content.toString();
        }catch(error){
            console.error('[Quantum Cloud] (at @utilities/userContainer - getLog):', error);
            return '';
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
                await this.createAndStartContainer();
            }else{
                this.criticalErrorHandler('startContainer', error);
            }
        }
    };

    async getExistingContainer(){
        const existingContainer = this.docker.getContainer(this.dockerName);
        const { State } = await existingContainer.inspect();
        if(!State.Running) await existingContainer.start();
        return existingContainer;
    };

    async createAndStartContainer(){
        try{
            const imageName = 'alpine:latest';
            const imageExists = await this.checkIfImageExists(imageName);
            if(!imageExists) await this.pullImage(imageName);
            const storagePath = `${__dirname}/../storage/containers/${this.user._id}`;
            await this.ensureDirectoryExists(storagePath);
            const container = await this.createContainer(imageName, storagePath);
            await container.start();
            this.instance = container;
            global.userContainers[this.user._id] = this;
            await this.installPackages();
        }catch(error){
            this.criticalErrorHandler('createContainer', error);
        }
    };

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

    async createContainer(imageName, storagePath){
        return this.docker.createContainer({
            Image: imageName,
            name: this.dockerName,
            Tty: true,
            OpenStdin: true,
            StdinOnce: true,
            Cmd: ['/bin/ash'],
            HostConfig: { 
                Binds: [`${storagePath}:/app:rw`],
                PublishAllPorts: true
            }
        });
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

    async installPackages(){
        try{
            await this.executeCommand('apk update');
            await this.executeCommand('apk add --no-cache git docker nodejs npm python3');
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

    cleanOutput(data){
        return data.toString('utf8').replace(/[^ -~\n\r]+/g, '');
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

    async createLogStream(){
        try{
            const { _id } = this.user;
            if(global.logStreamStore[_id]){
                global.logStreamStore[_id].end();
                delete global.logStreamStore[_id];
            } 
            await this.ensureDirectoryExists(this.logDir);
            const stream = createWriteStream(this.logFile);
            global.logStreamStore[_id] = stream;
            return stream;
        }catch(error){
            this.criticalErrorHandler('createLogStream', error);
        }
    };

    async appendLog(data){
        await this.checkLogFileStatus();
        const stream = await this.logStream;
        stream.write(data);
    };

    async checkLogFileStatus(){
        try{
            const stats = await stat(this.logFile);
            const maxSize = process.env.LOG_PATH_MAX_SIZE * 1024;
            if(stats.size > maxSize) await truncate(this.logFile, 0);
        }catch(error){
            this.criticalErrorHandler('checkLogFileStatus', error);
        }
    };

    async pullImage(imageName){
        console.log(`[Quantum Cloud]: Pulling "${imageName}"...`);
        try{
            await new Promise((resolve, reject) => {
                this.docker.pull(imageName, (error, stream) => {
                    if(error){
                        reject(error);
                    }else{
                        this.docker.modem.followProgress(stream, (fprogressError) => {
                            if(fprogressError) reject(fprogressError);
                            else resolve();
                        });
                    }
                });
            });
            console.log(`[Quantum Cloud]: Image "${imageName}" downloaded.`);
        }catch(error){
            console.error('Error pulling image:', error);
        }
    };

    criticalErrorHandler(operation, error){
        console.error(`[Quantum Cloud] CRITICAL ERROR (at @utilities/userContainer - ${operation}):`, error);
        throw error;
    };
};

module.exports = UserContainer;