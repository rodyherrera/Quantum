const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate);
const path = require('path');
const nodePty = require('node-pty');
const Deployment = require('@models/deployment');

class BasePTYHandler{
    constructor(entityId, rootDirectory = '/'){
        this.entityId = entityId;
        this.rootDirectory = rootDirectory;
        this.logStream = this.createLogStream();
    };

    async appendLog(log){
        const logPath = this.getLogAbsPath(this.entityId);
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

    static create(entityId = null, workingDir){
        if(fs.existsSync(`${__dirname}/../storage/repositories/${entityId}`)){
            workingDir = `${__dirname}/../storage/repositories/${entityId}${workingDir}`;
        }
        const shell = nodePty.spawn('bash', ['-i'], {
            name: 'xterm-color',
            cwd: workingDir
        });
        return shell;
    };

    getLogAbsPath(){
        return `${__dirname}/../storage/pty-log/${this.entityId}.log`;
    };

    createLogStream(){
        if(global.logStreamStore[this.entityId]){
            global.logStreamStore[this.entityId].end();
            delete global.logStreamStore[this.entityId];
        }
        const logDir = path.join(__dirname, '..', 'storage', 'pty-log');
        if(!fs.existsSync(logDir)){
            try{
                fs.mkdirSync(logDir, { recursive: true });
            }catch(error){
                console.error('[Quantum Cloud]: Critical Error (@utilities/ptyHandler:createLogStream)', error);
            }
        }
        const stream = fs.createWriteStream(this.getLogAbsPath(), { flags: 'a' });
        global.logStreamStore[this.entityId] = stream;
        return stream;
    };

    clearRuntimePTYLog(){
        this.logStream.end();
    };

    removeFromRuntimeStore(){
        delete global.ptyStore[this.entityId];
    };

    removeFromRuntimeStoreAndKill(){
        const shell = this.getOrCreate();
        shell.kill();
        this.removeFromRuntimeStore();
    };

    readLog(){
        if(!fs.existsSync(this.getLogAbsPath(this.entityId)))
            return '';
       return fs.readFileSync(this.getLogAbsPath(this.entityId)).toString();
    };

    getLog(){
        const log = this.readLog(this.entityId);
        return log;
    };

    getOrCreate(){
        if(global.ptyStore[this.entityId])
            return global.ptyStore[this.entityId];
        global.ptyStore[this.entityId] = PTYHandler.create(this.entityId, this.rootDirectory);
        return global.ptyStore[this.entityId];
    };
};

class PTYHandler extends BasePTYHandler{
    constructor(repositoryId, repositoryDocument){
        super(repositoryId, repositoryDocument.rootDirectory);
        this.repositoryDocument = repositoryDocument;
    };

    async startRepository(githubUtility){
        const { buildCommand, installCommand, startCommand, deployments } = this.repositoryDocument;
        const commands = [installCommand, buildCommand, startCommand];
        const shell = this.getOrCreate();
        if(!buildCommand && !installCommand && !startCommand) return;
        const currentDeploymentId = deployments[0];
        const deployment = await Deployment.findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
        const formattedEnvironment = deployment.getFormattedEnvironment();
        shell.on('data', (data) => {
            data = data.replace(/.*#/g, this.getPrompt());
            this.appendLog(data);
        });
        for(const command of commands){
            if(!command.length) continue;
            shell.write(`${formattedEnvironment} ${command}\r\n`);
        }
        githubUtility
            .updateDeploymentStatus(deployment.githubDeploymentId, 'success');
        deployment.status = 'success';
        deployment.save();
    };

    getPrompt(){
        const { name, user } = this.repositoryDocument;
        return `\x1b[1;92m${user.username}\x1b[0m@\x1b[1;94m${name}:~$\x1b[0m`;
    };
};

class CloudConsoleHandler extends BasePTYHandler{
    constructor(userId){
        super(userId);
    };
};

module.exports = {
    PTYHandler,
    CloudConsoleHandler
};