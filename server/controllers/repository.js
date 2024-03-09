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
        'domains',
        'port',
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

/**
 * Fetches and retrieves a list of all GitHub repositories associated with a user's access token.  
 *
 * @param {string} accessToken - The user's GitHub access token.
 * @returns {Promise<Array>} Promise resolving to an array of repository data objects.
*/
const getGithubRepositories = async (accessToken) => {
    const response = await axios.get(`https://api.github.com/user/repos`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { visibility: 'all' }
    });
    return response.data;
};

/**
 * Filters a list of GitHub repositories, removing any that already exist in a user's own repositories.
 *
 * @param {Array} githubRepositories - Array of GitHub repository data objects.
 * @param {Array} userRepositories - Array of the user's own repository objects.
 * @returns {Array} A filtered array of GitHub repositories.
*/
const filterRepositories = (githubRepositories, userRepositories) => {
    return githubRepositories.filter((repository) => {
        return !userRepositories.some((userRepository) => userRepository.name === repository.full_name);
    });
};

/**
 * Endpoint: Retrieves filtered GitHub repositories for a user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
*/
exports.getMyGithubRepositories = catchAsync(async (req, res) => {
    const { accessToken } = req.user.github;
    const githubRepositories = await getGithubRepositories(accessToken);
    const sanitizedRepositories = filterRepositories(githubRepositories, req.user.repositories);
    res.status(200).json({ status: 'success', data: sanitizedRepositories });
});

/**
 * Endpoint: Retrieves a user's custom repositories from data storage.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
*/
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

/**
 * Helper function to generate a file/directory path within the designated user storage area.  
 *
 * @param {Object} req - Express request object
 * @returns {string} Constructed file system path
*/
const getRequestedPath = (req) => {
    const route = req.params.route || '';
    const basePath = path.join(process.env.STORAGE_PATH, `/containers/${req.user._id}/github-repos/`, req.params.id);
    return path.join(basePath, route);
};

/**
 * Endpoint: Provides directory listing for file storage exploration.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
*/
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

/**
 * Endpoint: Handles updating the content of a file within the user's designated storage area.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express 'next' function (likely used for error handling middleware)
*/
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

/**
 * Endpoint: Reads and returns the contents of a file from the user's storage.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
*/
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