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

import Deployment from '@models/deployment';
import Repository from '@models/repository';
import HandlerFactory from '@controllers/common/handlerFactory';
import RuntimeError from '@utilities/runtimeError';
import Github from '@services/github';
import RepositoryHandler from '@services/repositoryHandler';
import { catchAsync } from '@utilities/helpers';
import { Request, Response } from 'express';
import { IDeployment } from '@typings/models/deployment';
import { IRepository } from '@typings/models/repository';
import { ActiveDeploymentEnvironment, ActiveDeploymentRepositoryDocument } from '@typings/controllers/deployment';

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

export const getDeployments = DeploymentFactory.getAll();
export const getDeployment = DeploymentFactory.getOne();
export const createDeployment = DeploymentFactory.createOne();
export const updateDeployment = DeploymentFactory.updateOne();
export const deleteDeployment = DeploymentFactory.deleteOne();

/** 
 * Handles repository-related actions (restart, stop, start). Interacts with the GitHub API for deployment status updates.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>}
 */
const repositoryOperationHandler = async (repository: any, action: string) => {
    await repository.populate({
        path: 'user',
        select: 'username',
        populate: { path: 'github', select: 'accessToken username' }
    });
    const repositoryHandler = new RepositoryHandler(repository, repository.user);
    const github = new Github(repository.user, repository);
    const currentDeploymentId = repository.deployments[0];
    const currentDeployment = await Deployment.findById(currentDeploymentId) as IDeployment;
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
            await currentDeployment.save();
            return { 
                status: 'error', 
                message: 'Deployment::Invalid::Action' 
            };
    }
    return currentDeployment;
};

/**
 * Handles repository operation requests, such as starting, stopping, and restarting deployments.
 *
 * @returns {Promise<void>}
 */
export const repositoryOperations = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as any;
    const { repositoryAlias } = req.params;
    const repository = await Repository
        .findOne({ user: user._id, alias: repositoryAlias });
    if(!repository)
        throw new RuntimeError('Repository::Not::Found', 404);
    const { action } = req.body;
    if(!action)
        throw new RuntimeError('Repository::Action::Required', 400);
    const currentDeployment = await repositoryOperationHandler(repository, action);
    if(currentDeployment && currentDeployment.status === 'error'){
        res.status(400).json(currentDeployment);
    }else{
        res.status(200).json({
            status: 'success',
            data: { 
                status: currentDeployment.status, 
                repository 
            } 
        });
    }
});

/**
 * Retrieves the deployments of a GitHub repository.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {RuntimeError} If the deployments are not found. 
 */
export const getRepositoryDeployments = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as any;
    const { repositoryName } = req.params;
    const github = new Github(user, { name: repositoryName } as IRepository);
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
export const deleteGithubDeployment = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as any;
    const { repositoryName, deploymentId } = req.params;
    const github = new Github(user, { name: repositoryName } as IRepository);
    await github.deleteRepositoryDeployment(deploymentId);
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

/**
 * Retrieves the active deployment environment for a given repository.
 *s
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {RuntimeError} If the repository is not found.
 * @returns {Object} An object containing the environment details and deployment ID
 */
export const getActiveDeploymentEnvironment = catchAsync(async (req: Request, res: Response) => {
    const { user } = req as any;
    const { repositoryAlias } = req.params;
    const repository = await Repository
        .findOne({ alias: repositoryAlias, user: user._id })
        .select('deployments')
        .populate<ActiveDeploymentRepositoryDocument>({
            path: 'deployments',
            select: '_id environment'
        });
    if(!repository)
        throw new RuntimeError('Repository::Not::Found', 404);
    const activeDeployment = repository.deployments.pop() as ActiveDeploymentEnvironment;
    const { environment, _id } = activeDeployment;
    res.status(200).json({ status: 'success', data: { ...environment, _id } });
});

export default {
    getDeployments,
    getDeployment,
    createDeployment,
    updateDeployment,
    deleteDeployment,
    repositoryOperations,
    getRepositoryDeployments,
    deleteGithubDeployment,
    getActiveDeploymentEnvironment
};