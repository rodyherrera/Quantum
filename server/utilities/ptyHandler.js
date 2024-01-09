const pty = require('node-pty');
const fs = require('fs');

class PTYHandler {
    constructor(repositoryId) {
        this.repositoryId = repositoryId;
        this.logStream = this.createLogStream();
    };

    getLogAbsPath(){
        return `${__dirname}/../storage/pty-log/${this.repositoryId}.log`;
    };

    createLogStream(){
        if(!fs.existsSync(`${__dirname}/../storage/pty-log`)){
            fs.mkdirSync(`${__dirname}/../storage/pty-log`);
        }
        return fs.createWriteStream(this.getLogAbsPath(), { flags: 'a' });
    };

    clearRuntimePTYLog(){
        global.ptyLog[this.repositoryId] = '';
        this.logStream.end();
    };
    
    readLog(){
        if(!fs.existsSync(this.getLogAbsPath(this.repositoryId)))
            return '';
        return fs.readFileSync(this.getLogAbsPath(this.repositoryId)).toString();
    };

    getLog(){
        let log = global.ptyLog?.[this.repositoryId];
        if(!log) log = this.readLog(this.repositoryId);
        return log;
    };

    appendLog(log){
        const currentLog = this.getLog(this.repositoryId);
        this.logStream.write(log);
        global.ptyLog[this.repositoryId] = currentLog + log;
    };

    getOrCreate(){
        if(global.ptyStore[this.repositoryId])
            return global.ptyStore[this.repositoryId];
        global.ptyStore[this.repositoryId] = PTYHandler.create(this.repositoryId);
        return global.ptyStore[this.repositoryId];
    };

    static create(repositoryId){
        const workingDir = `${__dirname}/../storage/repositories/${repositoryId}`;
        const shell = pty.spawn('bash', ['-i'], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: workingDir,
        });
        return shell;
    };
};

module.exports = PTYHandler;