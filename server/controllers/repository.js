const axios = require('axios');
const Repository = require('../models/repository');
const HandlerFactory = require('./handlerFactory');
const { catchAsync } = require('../utilities/runtime');
const { getRepositoryInfo } = require('../utilities/github');

const RepositoryFactory = new HandlerFactory({
    model: Repository,
    fields: [
        'name',
        'url',
        'user',
        'deployments'
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
    res.status(200).json({
        status: 'success',
        data: sanitizedRepositories
    });
});

exports.getMyRepositories = catchAsync(async (req, res) => {
    const repositories = await Repository.find({ user: req.user._id });
    // add repository info to each repository
    const repositoriesWithInfo = await Promise.all(repositories.map(async (repository) => {
        const repositoryInfo = await getRepositoryInfo(req.user, repository);
        return {
            ...repository.toObject(),
            ...repositoryInfo
        };
    }));
    res.status(200).json({
        status: 'success',
        data: repositoriesWithInfo
    });
});