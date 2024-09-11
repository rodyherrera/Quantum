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

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Repository from '@models/repository';
import HandlerFactory from '@controllers/handlerFactory';
import Deployment from '@models/deployment';
import Github from '@services/github';
import RuntimeError from '@utilities/runtimeError';
import { catchAsync } from '@utilities/runtime';
import { Request, Response, NextFunction } from 'express';

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

export const getRepositories = RepositoryFactory.getAll();
export const getRepository = RepositoryFactory.getOne();
export const createRepository = RepositoryFactory.createOne();
export const updateRepository = RepositoryFactory.updateOne();
export const deleteRepository = RepositoryFactory.deleteOne();

/**
 * Fetches and retrieves a list of all GitHub repositories associated with a user's access token.  
 *
 * @param {string} accessToken - The user's GitHub access token.
 * @returns {Promise<Array>} Promise resolving to an array of repository data objects.
*/
const getGithubRepositories = async (accessToken: string): Promise<any[]> => {
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
const filterRepositories = (githubRepositories: any[], userRepositories: any[]): any[] => {
    return githubRepositories.filter((repository) => {
        return !userRepositories.some((userRepository) => userRepository.name === repository.full_name);
    });
};

/**
 * Endpoint: Retrieves filtered GitHub repositories for a user.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
*/
export const getMyGithubRepositories = catchAsync(async (req: Request, res: Response) => {
    const { accessToken } = req.user.github;
    const githubRepositories = await getGithubRepositories(accessToken);
    const sanitizedRepositories = filterRepositories(githubRepositories, req.user.repositories);
    res.status(200).json({ status: 'success', data: sanitizedRepositories });
});

/**
 * Endpoint: Retrieves a user's custom repositories from data storage.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object 
*/
export const getMyRepositories = catchAsync(async (req: Request, res: Response) => {
    const repositories = await Repository.find({ user: req.user._id }).lean();
    for(const repository of repositories){
        const activeDeploymentId = repository.deployments[0];
        if(!activeDeploymentId)continue;
        const deployment = await Deployment.findById(activeDeploymentId).select('status');
        repository.activeDeployment = deployment;
    }
    const repositoriesWithInfo = await Promise.all(repositories.map(async (repository) => {
        const github = new Github(req.user, repository);
        const repositoryInfo = await github.getRepositoryInfo();
        if(!repositoryInfo)return null;
        return { ...repository, ...repositoryInfo };
    }));
    const filteredRepositoriesWithInfo = repositoriesWithInfo.filter(repo => repo !== null);
    res.status(200).json({ status: 'success', data: filteredRepositoriesWithInfo });
});

/**
 * Helper function to generate a file/directory path within the designated user storage area.  
 *
 * @param {Request} req - Express request object
 * @returns {string} Constructed file system path
*/
const getRequestedPath = (req: Request): string => {
    const route = req.params.route || '';
    const basePath = path.join('/var/lib/quantum', process.env.NODE_ENV, `/containers/${req.user._id}/github-repos/`, req.params.id);
    return path.join(basePath, route);
};

/**
 * Endpoint: Provides directory listing for file storage exploration.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object 
*/
export const storageExplorer = catchAsync(async (req: Request, res: Response) => {
    const requestedPath = getRequestedPath(req);
    const files = fs.readdirSync(requestedPath);
    const fileDetails: { name: string, isDirectory: boolean }[] = [];
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
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express 'next' function (likely used for error handling middleware)
*/
export const updateRepositoryFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object 
*/
export const readRepositoryFile = catchAsync(async (req: Request, res: Response) => {
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