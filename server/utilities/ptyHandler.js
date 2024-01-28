const pty = require('node-pty');
const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);
const Deployment = require('@models/deployment');

class PTYHandler{
    constructor(repositoryId, repositoryDocument){
        this.repositoryId = repositoryId;
        this.repositoryDocument = repositoryDocument;
        // I think I'm managing this wrong, this stream is being 
        // created in each class instance and not being 
        // destroyed, maybe it should also be in this global pty variable.
        this.logStream = this.createLogStream();
    };

    async appendLog(log){
        const logPath = this.getLogAbsPath(this.repositoryId);
        await this.checkLogFileStatus(logPath);
        this.logStream.write(log);
    };

    // When a connection is made to the repository shell through the WebUI, a 
    // stream is made with the file, so that it does not have to be constantly 
    // opened and closed to write data. If a constant write is issued, the file 
    // will increase in size, which will mean that when you want to obtain the 
    // log it will take longer to send the packets. This function is responsible 
    // for verifying the size of the file, if it is greater 
    // than what is allowed, it will be emptied.
    // 
    // TODO: Maybe I should persist the log and send the last 
    // TODO: "x" lines to the socket, allowing the user to delete the log manually?
    async checkLogFileStatus(logPath){
        try{
            const stats = await stat(logPath);
            const maxSize = process.env.LOG_PATH_MAX_SIZE * 1024;
            if(stats.size > maxSize) await truncate(logPath, 0);
        }catch(error){
            console.error('[Quantum Cloud]: Error when trying to truncate file:', logPath, '\n' + error);
        }
    };

    async startRepository(){
        const { buildCommand, installCommand, startCommand, deployments } = this.repositoryDocument;
        const commands = [installCommand, buildCommand, startCommand];
        const shell = this.getOrCreate();
        const currentDeploymentId = deployments[0];
        const deployment = await Deployment.findById(currentDeploymentId).select('environment');
        const formattedEnvironment = deployment.getFormattedEnvironment();
        shell.on('data', (data) => {
            data = data.replace(/.*#/g, this.getPrompt());
            this.appendLog(data);
        });
        for(const command of commands){
            if(!command.length) continue;
            shell.write(`${formattedEnvironment} ${command}\r\n`);
        }
    };

    static create(repositoryId){
        const workingDir = `${__dirname}/../storage/repositories/${repositoryId}`;
        const shell = pty.spawn('bash', ['-i'], {
            name: 'xterm-color',
            cwd: workingDir,
        });
        return shell;
    };

    getLogAbsPath(){
        return `${__dirname}/../storage/pty-log/${this.repositoryId}.log`;
    };

    createLogStream(){
        if(!fs.existsSync(`${__dirname}/../storage/pty-log`))
            fs.mkdirSync(`${__dirname}/../storage/pty-log`);
        return fs.createWriteStream(this.getLogAbsPath(), { flags: 'a' });
    };

    clearRuntimePTYLog(){
        this.logStream.end();
    };

    removeFromRuntimeStore(){
        delete global.ptyStore[this.repositoryId];
    };

    removeFromRuntimeStoreAndKill(){
        const shell = this.getOrCreate();
        shell.kill();
        this.removeFromRuntimeStore();
    };

    getPrompt(){
        const { name, user } = this.repositoryDocument;
        return `\x1b[1;92m${user.username}\x1b[0m@\x1b[1;94m${name}:~$\x1b[0m`;
    };
    
    readLog(){
        if(!fs.existsSync(this.getLogAbsPath(this.repositoryId)))
            return '';
       return fs.readFileSync(this.getLogAbsPath(this.repositoryId)).toString();
    };

    getLog(){
        const log = this.readLog(this.repositoryId);
        return log;
    };

    getOrCreate(){
        if(global.ptyStore[this.repositoryId])
            return global.ptyStore[this.repositoryId];
        global.ptyStore[this.repositoryId] = PTYHandler.create(this.repositoryId);
        return global.ptyStore[this.repositoryId];
    };
};

module.exports = PTYHandler;