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

const Deployment = require('@models/deployment');
const Repository = require('@models/repository');
const HandlerFactory = require('@controllers/handlerFactory');
const RuntimeError = require('@utilities/runtimeError');
const Github = require('@utilities/github');
const RepositoryHandler = require('@utilities/repositoryHandler');
const { catchAsync } = require('@utilities/runtime');

const DeploymentFactory = new HandlerFactory({
    model: Deployment,
    fields: [
        'user',
        'repository',
        'environment',
        'commit',
        'status',
        'url'
    ]
});

exports.getDeployments = DeploymentFactory.getAll();
exports.getDeployment = DeploymentFactory.getOne();
exports.createDeployment = DeploymentFactory.createOne();
exports.updateDeployment = DeploymentFactory.updateOne();
exports.deleteDeployment = DeploymentFactory.deleteOne();

/** 
 * Handles repository-related actions (restart, stop, start). Interacts with the GitHub API for deployment status updates.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>}
*/
const repositoryOperationHandler = async (repository, action) => {
    await repository.populate({
        path: 'user',
        select: 'username',
        populate: { path: 'github', select: 'accessToken username' }
    });
    const repositoryHandler = new RepositoryHandler(repository, repository.user);
    const github = new Github(repository.user, repository);
    const currentDeploymentId = repository.deployments[0];
    const currentDeployment = await Deployment.findById(currentDeploymentId);
    const { githubDeploymentId } = currentDeployment;
    if(!currentDeployment)
        throw new RuntimeError('Deployment::Not::Found', 404);
    currentDeployment.status = 'queued';
    github.updateDeploymentStatus(githubDeploymentId, 'queued');
    await currentDeployment.save();
    switch(action){
        case 'restart':
            repositoryHandler.removeFromRuntime();
            repositoryHandler.start(github);
            // TODO: Can be refactored using mongoose middlewares
            github.updateDeploymentStatus(githubDeploymentId, 'success');
            break;
        case 'stop':
            repositoryHandler.removeFromRuntime();
            currentDeployment.status = 'stopped';
            await currentDeployment.save();
            github.updateDeploymentStatus(githubDeploymentId, 'inactive');
            break;
        case 'start':
            repositoryHandler.start(github);
            github.updateDeploymentStatus(githubDeploymentId, 'success');
            break;
        default:
            currentDeployment.status = 'success';
            currentDeployment.save();
            res.status(400).json({ 
                status: 'error', 
                message: 'Deployment::Invalid::Action' 
            });
            return;
    }
    return currentDeployment;
};

/**
 * Handles repository operation requests, such as starting, stopping, and restarting deployments.
 *
 * @returns {Promise<void>}
*/
exports.repositoryOperations = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryAlias } = req.params;
    const repository = await Repository
        .findOne({ user: user._id, alias: repositoryAlias });
    if(!repository)
        throw new RuntimeError('Repository::Not::Found', 404);
    const { action } = req.body;
    if(!action)
        throw new RuntimeError('Repository::Action::Required', 400);
    const currentDeployment = await repositoryOperationHandler(repository, action);
    res.status(200).json({
        status: 'success', 
        data: { 
            status: currentDeployment.status, 
            repository 
        } 
    });
});

/**
 * Retrieves the deployments of a GitHub repository.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {RuntimeError} If the deployments are not found. 
*/
exports.getRepositoryDeployments = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryName } = req.params;
    const github = new Github(user, { name: repositoryName });
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

/**
 * Deletes a GitHub deployment and retrieves the updated deployments of a repository.  
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {RuntimeError} If the deployments are not found. 
*/
exports.deleteGithubDeployment = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryName, deploymentId } = req.params;
    const github = new Github(user, { name: repositoryName });
    await github.deleteRepositoryDeployment(deploymentId);
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

/**
 * Retrieves the active deployment environment for a given repository.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {RuntimeError} If the repository is not found.
 * @returns {Object} An object containing the environment details and deployment ID
*/
exports.getActiveDeploymentEnvironment = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryAlias } = req.params;
    const repository = await Repository
        .findOne({ alias: repositoryAlias, user: user._id })
        .select('deployments')
        .populate('deployments');
    if(!repository)
        throw new RuntimeError('Repository::Not::Found');
    // Is .slice(-1) the correct way of retrieve the last
    // item of deployments array?
    const activeDeployment = repository.deployments.pop();
    const { environment, _id } = activeDeployment;
    res.status(200).json({ status: 'success', data: { ...environment, _id } });
});

module.exports = exports;