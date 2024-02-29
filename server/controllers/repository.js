/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Repository = require('@models/repository');
const HandlerFactory = require('@controllers/handlerFactory');
const Deployment = require('@models/deployment');
const Github = require('@utilities/github');
const RuntimeError = require('@utilities/runtimeError');
const { catchAsync } = require('@utilities/runtime');

const RepositoryFactory = new HandlerFactory({
    model: Repository,
    fields: [
        'name',
        'url',
        'user',
        'alias',
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
        if(!repositoryInfo) return null;
        return { ...repository, ...repositoryInfo };
    }));
    const filteredRepositoriesWithInfo = repositoriesWithInfo.filter(repo => repo !== null);
    res.status(200).json({ status: 'success', data: filteredRepositoriesWithInfo });
});

const getRequestedPath = (req) => {
    const route = req.params.route || '';
    const basePath = path.join(__dirname, `../storage/containers/${req.user._id}/github-repos/`, req.params.id);
    return path.join(basePath, route);
};

exports.storageExplorer = catchAsync(async (req, res) => {
    const requestedPath = getRequestedPath(req);
    const files = fs.readdirSync(requestedPath);
    const fileDetails = [];
    for(const file of files){
        const filePath = path.join(requestedPath, file);
        const stat = fs.statSync(filePath);
        const isDirectory = stat.isDirectory();
        fileDetails.push({ name: file, isDirectory });
    }
    res.status(200).json({ status: 'success', data: fileDetails });
});

exports.updateRepositoryFile = catchAsync(async (req, res, next) => {
    const requestedPath = getRequestedPath(req);
    if(!fs.existsSync(requestedPath))
        return next(new RuntimeError('RepositoryFileNotExists', 404));
    const { content } = req.body;
    if(!content)
        return next(new RuntimeError('RepositoryFileUpdateContentRequired', 400));
    fs.writeFileSync(requestedPath, content, 'utf-8');
    res.status(200).json({ status: 'success' });
});

exports.readRepositoryFile = catchAsync(async (req, res) => {
    const requestedPath = getRequestedPath(req);
    const fileName = path.basename(requestedPath);
    const fileContent = fs.readFileSync(requestedPath, 'utf-8');
    res.status(200).json({
        status: 'success',
        data: {
            name: fileName,
            content: fileContent
        }
    });
});