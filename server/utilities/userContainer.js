const Docker = require('dockerode');
const path = require('path');
const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);

class UserContainer{
    constructor(user){
        this.docker = new Docker();
        this.user = user;
        this.dockerName = this.user._id.toString().replace(/[^a-zA-Z0-9_.-]/g, '_');
        this.instance = null;
        this.logDir =  path.join(__dirname, '..', 'storage', 'containers', this.user._id.toString(), 'logs');
        this.logFile = `${this.logDir}/${this.user._id}.log`;
        this.logStream = this.createLogStream();
    };

    async getLog(){
        if(!fs.existsSync(this.logFile)) return '';
        const content = await fs.promises.readFile(this.logFile);
        return content.toString();
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

    async appendLog(data){
        await this.checkLogFileStatus();
        const stream = await this.logStream;
        stream.write(data);
    };

    async createLogStream(){
        if(global.logStreamStore[this.user._id]){
            global.logStreamStore[this.user._id].end();
            delete global.logStreamStore[this.user._id];
        }
        if(!fs.existsSync(this.logDir)){
            try{
                await fs.promises.mkdir(this.logDir);
            }catch(error){
                this.criticalErrorHandler('createLogStream', error);
            }
        }
        const stream = fs.createWriteStream(this.logFile);
        global.logStreamStore[this.user._id] = stream;
        return stream;
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
            await fs.promises.access(directoryPath);
        }catch(error){
            if(error.code === 'ENOENT'){
                await fs.promises.mkdir(directoryPath, { recursive: true });
            }else{
                throw error;
            }
        }
    };

    async executeInteractiveShell(socket, workingDir = '/app'){
        const command = `export PS1='\\n\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\n\\$ ' && /bin/ash`;

        const exec = await this.instance.exec({
            Cmd: ['/bin/ash', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
            AttachStdin: true,
            WorkingDir: workingDir,
            Tty: true
        });
        const stream = await exec.start({ hijack: true, stdin: true });
        socket.emit('history', await this.getLog());
        socket.on('command', (command) => {
            stream.write(command + '\n');
        });
        stream.on('data', (chunk) => {
            const lines = chunk.toString('utf8').split('\n');
            lines.forEach((line) => {
                socket.emit('response', line + '\r\n');
            });
        });
    };

    static cleanOutput = (data) => {
        return data.toString('utf8')
            .replace(/[^ -~\n\r]+/g, '')
            .replace(/\x1B\[[0-9;]*[JKmsu]/g, '')
            .replace(/\u001b\[.*?m/g, '');
    };

    async executeCommand(command){
        try{
            const exec = await this.instance.exec({
                Cmd: ['/bin/ash', '-c', command],
                AttachStdout: true,
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
                data = UserContainer.cleanOutput(data);
                output += data;
                this.appendLog(data);
            });
            stream.on('end', () => resolve(output));
            stream.on('error', (error) => reject(error));
        });
    };

    async installPackages(){
        try{
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