const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const Deployment = require('../models/deployment');

const cloneRepository = async (repository) => {
    await simpleGit().clone(repository.url, `./storage/repositories/${repository._id}`);
};

const getLatestCommit = async (user, repository) => {
    const octokit = new Octokit({ auth: user.github.accessToken });
    const { data: commits } = await octokit.repos.listCommits({
        owner: user.github.username,
        repo: repository.name,
        per_page: 1,
        sha: 'main'
    });
    return commits[0];
};

const createNewDeployment = async (repository, user, latestCommit) => {
    const newDeployment = new Deployment({
        user: user._id,
        repository: repository._id,
        environment: {
            name: 'production',
            variables: {}
        },
        commit: {
            message: latestCommit.commit.message,
            author: {
                name: latestCommit.commit.author.name,
                email: latestCommit.commit.author.email
            },
            date: latestCommit.commit.author.date
        },
        status: 'pending'
    });
    await newDeployment.save();
    return newDeployment;
};

const createGithubDeployment = async (repositoryName, githubUsername) => {
    const octokit = new Octokit({ auth: user.github.accessToken });
    const { data: { id: deploymentId } } = await octokit.repos.createDeployment({
        owner: githubUsername,
        repo: repositoryName,
        ref: 'main',
        auto_merge: false,
        required_contexts: [],
        environment: 'production'
    });
    if(!deploymentId)
        throw new RuntimeError('Deployment::Not::Created', 500);
    return deploymentId;
};

exports.getRepositoryDeployments = async (user, repositoryName) => {
    const octokit = new Octokit({ auth: user.github.accessToken });
    const { data: deployments } = await octokit.repos.listDeployments({
        owner: user.github.username,
        repo: repositoryName
    });
    return deployments;
};

exports.deleteRepositoryDeployment = async (user, repositoryName, deploymentId) => {
    const octokit = new Octokit({ auth: user.github.accessToken });
    await octokit.repos.deleteDeployment({
        owner: user.github.username,
        repo: repositoryName,
        deployment_id: deploymentId
    });
};

exports.deployRepository = async (repository, user) => {
    try{
        await cloneRepository(repository);
        const latestCommit = await getLatestCommit(user, repository);
        const newDeployment = await createNewDeployment(repository, user, latestCommit);
        const deploymentId = await createGithubDeployment(repository, user);
        newDeployment.url = `https://github.com/${user.github.username}/${repository.name}/deployments/${deploymentId}`;
        newDeployment.status = 'success';
        await newDeployment.save();
        return newDeployment;
    }catch(error){
        console.log('[Quantum Cloud]:', error);
    }
};

module.exports = exports;