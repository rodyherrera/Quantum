const axios = require('axios');
const Repository = require('@models/repository');
const HandlerFactory = require('@controllers/handlerFactory');
const Deployment = require('@models/deployment');
const Github = require('@utilities/github');
const { catchAsync } = require('@utilities/runtime');

const RepositoryFactory = new HandlerFactory({
    model: Repository,
    fields: [
        'name',
        'url',
        'user',
        'deployments',
        'buildCommand',
        'installCommand',
        'startCommand',
        'rootDirectory'
    ]
});

exports.getRepositories = RepositoryFactory.getAll();
exports.getRepository = RepositoryFactory.getOne();
exports.createRepository = RepositoryFactory.createOne();
exports.updateRepository = RepositoryFactory.updateOne();
exports.deleteRepository = RepositoryFactory.deleteOne();

const getGithubRepositories = async (accessToken) => {
    const response = await axios.get(`https://api.github.com/user/repos`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { visibility: 'all' }
    });
    return response.data;
};

const filterRepositories = (githubRepositories, userRepositories) => {
    return githubRepositories.filter((repository) => {
        return !userRepositories.some((userRepository) => userRepository.name === repository.full_name);
    });
};

exports.getMyGithubRepositories = catchAsync(async (req, res) => {
    const { accessToken } = req.user.github;
    const githubRepositories = await getGithubRepositories(accessToken);
    const sanitizedRepositories = filterRepositories(githubRepositories, req.user.repositories);
    res.status(200).json({ status: 'success', data: sanitizedRepositories });
});

exports.getMyRepositories = catchAsync(async (req, res) => {
    const repositories = await Repository.find({ user: req.user._id }).lean();
    for(const repository of repositories){
        const activeDeploymentId = repository.deployments[0];
        if(!activeDeploymentId) continue;
        const deployment = await Deployment.findById(activeDeploymentId).select('status');
        repository.activeDeployment = deployment;
    }
    const repositoriesWithInfo = await Promise.all(repositories.map(async (repository) => {
        const github = new Github(req.user, repository);
        const repositoryInfo = await github.getRepositoryInfo();
        return { ...repository, ...repositoryInfo };
    }));
    res.status(200).json({ status: 'success', data: repositoriesWithInfo });
});