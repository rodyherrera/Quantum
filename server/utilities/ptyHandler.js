const pty = require('node-pty');
const fs = require('fs');

class PTYHandler {
    constructor(repositoryId, repositoryDocument){
        this.repositoryId = repositoryId;
        this.repositoryDocument = repositoryDocument;
        this.logStream = this.createLogStream();
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
        global.ptyLog[this.repositoryId] = '';
        this.logStream.end();
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

    startRepository(){
        const { buildCommand, installCommand, startCommand } = this.repositoryDocument;
        const commands = [buildCommand, installCommand, startCommand];
        const shell = this.getOrCreate();
        shell.on('data', (data) => {
            data = data.replace(/.*\$/, this.getPrompt());
            this.appendLog(data);
        });
        for(const command of commands){
            shell.write(command + '\r\n');
        }
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