const Deployment = require('@models/deployment');

class RepositoryHandler{
    constructor(repository, user){
        this.repository = repository;
        this.user = user;
        this.workingDir = `/app/github-repos/${repository._id}${repository.rootDirectory}`;
    };

    async getOrCreateShell(){
        try{
            const userContainers = global.userContainers[this.user._id];
            if(userContainers?.[this.repository._id]){
                return userContainers[this.repository._id];
            }
            const { instance } = userContainers;
            const exec = await instance.exec({
                Cmd: ['/bin/ash'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: this.workingDir,
                Tty: true
            });
            const stream = await exec.start({ hijack: true, stdin: true });
            userContainers[this.repository._id] = stream;
            return stream;
        }catch(error){
            this.criticalErrorHandler('createShell', error);
        }
    };

    async executeInteractiveShell(socket){
        const repositoryShell = await this.getOrCreateShell();
        this.setupSocketEvents(socket, repositoryShell);
    };

    setupSocketEvents(socket, repositoryShell){
        socket.emit('history', '...');
        socket.on('command', (command) => repositoryShell.write(command + '\n'));
        repositoryShell.on('data', (chunk) => socket.emit('response', chunk.toString('utf8')));
    };

    async start(githubUtility){
        const commands = this.getValidCommands();
        if(commands.length === 0) return;
        const deployment = await this.getCurrentDeployment();
        const formattedEnvironment = deployment.getFormattedEnvironment();
        const repositoryShell = await this.getOrCreateShell();
        this.executeCommands(commands, formattedEnvironment, repositoryShell);
        const { githubDeploymentId } = deployment;
        githubUtility.updateDeploymentStatus(githubDeploymentId, 'success');
        deployment.status = 'success';
        await deployment.save();
    };

    getValidCommands(){
        const { buildCommand, installCommand, startCommand } = this.repository;
        return [installCommand, buildCommand, startCommand].filter(Boolean);
    };

    async getCurrentDeployment(){
        const currentDeploymentId = this.repository.deployments[0];
        return Deployment
            .findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
    };

    executeCommands(commands, formattedEnvironment, repositoryShell){
        for(const command of commands){
            const formattedCommand = `${formattedEnvironment} ${command}\r\n`;
            repositoryShell.write(formattedCommand);
        }
    };

    handleCriticalError(method, error){
        console.log(`[Quantum Cloud] CRITICAL ERROR (at @utilities/repositoryHandler - ${method}):`, error);
        throw error;
    }
};

module.exports = RepositoryHandler;