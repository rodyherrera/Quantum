const Deployment = require('@models/deployment');

class RepositoryHandler{
    constructor(repository, user){
        this.repository = repository;
        this.user = user;
    };

    async getOrCreateShell(){
        try{
            if(global.userContainers[this.user._id]?.[this.repository._id]){
                return global.userContainers[this.user._id][this.repository._id];
            }
            const container = global.userContainers[this.user._id];
            const exec = await container.instance.exec({
                Cmd: ['/bin/ash'],
                AttachStdout: true,
                AttachStderr: true,
                AttachStdin: true,
                WorkingDir: `/app/github-repos/${this.repository._id}${this.repository.rootDirectory}`,
                Tty: true
            });
            const stream = await exec.start({ hijack: true, stdin: true });
            global.userContainers[this.user._id][this.repository._id] = stream;
            return stream;
        }catch(error){
            console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/repositoryHandler - createShell):', error);
            throw error;
        }
    };

    async executeInteractiveShell(socket){
        const repositoryShell = await this.getOrCreateShell();
        socket.emit('history', '...');
        socket.on('command', (command) => repositoryShell.write(command + '\n'));
        repositoryShell.on('data', (chunk) => socket.emit('response', chunk.toString('utf8')));
    };

    async start(githubUtility){
        const {
            buildCommand,
            installCommand,
            startCommand,
            deployments } = this.repository;
        const commands = [installCommand, buildCommand, startCommand];
        if(!buildCommand && !installCommand && !startCommand) return;
        const currentDeploymentId = deployments[0];
        const deployment = await Deployment
            .findById(currentDeploymentId)
            .select('environment githubDeploymentId status');
        const formattedEnvironment = deployment.getFormattedEnvironment();
        const repositoryShell = await this.getOrCreateShell();
        for(const command of commands){
            if(!command.length) continue;
            const formattedComamnd = `${formattedEnvironment} ${command}\r\n`;
            repositoryShell.write(formattedComamnd);
        }
        const { githubDeploymentId } = deployment;
        githubUtility.updateDeploymentStatus(githubDeploymentId, 'success');
        deployment.status = 'success';
        deployment.save();
    };
};

module.exports = RepositoryHandler;