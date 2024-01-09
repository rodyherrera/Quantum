const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const Deployment = require('../models/deployment');

class Github{
    constructor(user, repository){
        this.user = user;
        this.repository = repository;
        this.octokit = new Octokit({ auth: user.github.accessToken });
    };

    async cloneRepository(){
        await simpleGit().clone(this.repository.url, `./storage/repositories/${this.repository._id}`);
    };

    async readEnvironmentVariables(){
        let envFiles = await simpleGit(`./storage/repositories/${this.repository._id}`).raw(['ls-tree', 'HEAD', '-r', '--name-only']);
        envFiles = envFiles.split('\n').filter(file => file.includes('.env'));
        const environmentVariables = {};
        for(const envFile of envFiles){
            const file = await simpleGit(`./storage/repositories/${this.repository._id}`).raw(['show', 'HEAD:' + envFile]);
            file.split('\n').forEach(line => {
                if(line.includes('='))
                    environmentVariables[line.split('=')[0]] = line.split('=')[1];
            });
        };
        return environmentVariables;
    };

    async getLatestCommit(){
        const { data: commits } = await this.octokit.repos.listCommits({
            owner: this.user.github.username,
            repo: this.repository.name,
            per_page: 1,
            sha: 'main'
        });
        return commits[0];
    };

    async createNewDeployment(){
        const latestCommit = await this.getLatestCommit();
        const newDeployment = new Deployment({
            user: this.user._id,
            repository: this.repository._id,
            environment: {
                name: 'production',
                variables: await this.readEnvironmentVariables()
            },
            commit: {
                message: latestCommit.commit.message,
                author: {
                    name: latestCommit.commit.author.name,
                    email: latestCommit.commit.author.email
                },
                status: 'pending'
            }
        });
        await newDeployment.save();
        return newDeployment;
    };

    async createGithubDeployment(){
        const { data: { id: deploymentId } } = await this.octokit.repos.createDeployment({
            owner: this.user.github.username,
            repo: this.repository.name,
            ref: 'main',
            auto_merge: false,
            required_contexts: [],
            environment: 'Production'
        });
        if(!deploymentId)
            throw new RuntimeError('Deployment::Not::Created', 500);
        return deploymentId;
    };

    async getRepositoryDetails(){
        const { data: repositoryDetails } = await this.octokit.repos.get({
            owner: this.user.github.username,
            repo: this.repository.name
        });
        return repositoryDetails;
    };

    async getRepositoryInfo(){
        const latestCommit = await this.getLatestCommit();
        const details = await this.getRepositoryDetails();
        const information = {
            branch: details.default_branch,
            website: details.homepage,
            latestCommitMessage: latestCommit.commit.message,
            latestCommit: latestCommit.commit.author.date
        };
        return information;
    };

    async getRepositoryDeployments(){
        const { data: deployments } = await this.octokit.repos.listDeployments({
            owner: this.user.github.username,
            repo: this.repository.name
        });
        return deployments;
    };

    async deleteRepositoryDeployment(deploymentId){
        await this.octokit.repos.deleteDeployment({
            owner: this.user.github.username,
            repo: this.repository.name,
            deployment_id: deploymentId
        });
    };

    async deployRepository(){
        await this.cloneRepository();
        global.ptyStore[this.repository._id] = this.createRepositorPTY(this.repository._id);
        const newDeployment = await this.createNewDeployment();
        const deploymentId = await this.createGithubDeployment();
        newDeployment.url = `https://github.com/${this.user.github.username}/${this.repository.name}/deployments/${deploymentId}`;
        newDeployment.status = 'success';
        await newDeployment.save();
        return newDeployment;
    };
};

module.exports = Github;