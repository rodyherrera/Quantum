const pty = require('node-pty');
const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const truncate = util.promisify(fs.truncate)

class CloudConsoleHandler{
    constructor(userId){
        this.userId = userId;
        this.logStream = this.createLogStream();
    };

    async appendLog(log){
        const logPath = this.getLogAbsPath(this.userId);
        await this.checkLogFileStatus(logPath);
        this.logStream.write(log);
    };

    async checkLogFileStatus(logPath){
        try{
            const stats = await stat(logPath);
            const maxSize = process.env.LOG_PATH_MAX_SIZE * 1024;
            if(stats.size > maxSize) await truncate(logPath, 0);
        }catch(error){
            console.error('[Quantum Cloud]: Error when trying to truncate file:', logPath, '\n' + error);
        }
    };

    static create(){
        const shell = pty.spawn('bash', ['-i'], {
            name: 'xterm-color',
            cwd: '/'
        });
        return shell;
    };

    getLogAbsPath(){
        return `${__dirname}/../storage/pty-log/${this.userId}.log`;
    };

    createLogStream(){
        if(!fs.existsSync(`${__dirname}/../storage/pty-log`))
            fs.mkdirSync(`${__dirname}/../storage/pty-log`);
        return fs.createWriteStream(this.getLogAbsPath(), { flags: 'a' });
    };

    clearRuntimePTYLog(){
        this.logStream.end();
    };

    readLog(){
        if(!fs.existsSync(this.getLogAbsPath(this.userId)))
            return '';
       return fs.readFileSync(this.getLogAbsPath(this.userId)).toString();
    };

    getLog(){
        const log = this.readLog(this.repositoryId);
        return log;
    };

    getOrCreate(){
        if(global.ptyStore[this.userId])
            return global.ptyStore[this.userId];
        global.ptyStore[this.userId] = CloudConsoleHandler.create();
        return global.ptyStore[this.userId];
    };
};

module.exports = CloudConsoleHandler;