const Deployment = require('@models/deployment');

class RepositoryHandler{
    constructor(repository, user){
        this.repository = repository;
        this.user = user;
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
        const workingDir = `app/github-repos/${this.repository._id}`;
        // GET OR CREATE!!!
        const container = global.userContainers[this.user._id];
        for(const command of commands){
            if(!command.length) continue;
            const formattedComamnd = `${formattedEnvironment} ${command}\r\n`
            const out = await container.executeCommand(formattedComamnd, workingDir);
        }
        const { githubDeploymentId } = deployment;
        githubUtility.updateDeploymentStatus(githubDeploymentId, 'success');
        deployment.status = 'success';
        deployment.save();
    };
};

module.exports = RepositoryHandler;