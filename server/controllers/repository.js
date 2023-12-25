const axios = require('axios');
const Repository = require('../models/repository');
const HandlerFactory = require('./handlerFactory');
const { catchAsync } = require('../utilities/runtime');

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

exports.getMyGithubRepositories = catchAsync(async (req, res) => {
    const { accessToken } = req.user.github;
    const response = await axios.get(`https://api.github.com/user/repos`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { visibility: 'all' }
    });
    const sanitizedRepositories = response.data.filter((repository) => {
        return !req.user.repositories.some((userRepository) => userRepository.name === repository.full_name);
    });
    res.status(200).json({
        status: 'success',
        data: sanitizedRepositories
    });
});

exports.getMyRepositories = catchAsync(async (req, res) => {
    const repositories = await Repository.find({ user: req.user._id });
    res.status(200).json({
        status: 'success',
        data: repositories
    });
});