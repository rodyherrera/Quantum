import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Repository from '@models/repository';
import HandlerFactory from '@controllers/common/handlerFactory';
import Deployment from '@models/deployment';
import Github from '@services/github';
import RuntimeError from '@utilities/runtimeError';
import { catchAsync } from '@utilities/helpers';
import { Response, NextFunction } from 'express';
import { IRepository } from '@typings/models/repository';
import { IRequest } from '@typings/controllers/common';
import DockerContainer from '@models/docker/container';
import { IDockerContainer } from '@typings/models/docker/container';

const RepositoryFactory = new HandlerFactory({
    model: Repository,
    fields: [
        'name', 
        'url', 
        'user', 
        'alias', 
        'deployments', 
        'container',
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

const getGithubRepositories = async (accessToken: string): Promise<any[]> => {
    const response = await axios.get('https://api.github.com/user/repos', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { visibility: 'all', per_page: 100 }
    });
    return response.data;
};

const filterRepositories = (githubRepositories: any[], userRepositories: any[]): any[] => 
    githubRepositories.filter(repo => !userRepositories.some(userRepo => userRepo.name === repo.full_name));

export const getMyGithubRepositories = catchAsync(async (req: IRequest, res: Response) => {
    const user: any = req.user;
    const githubRepositories = await getGithubRepositories(user.github.getDecryptedAccessToken());
    const sanitizedRepositories = filterRepositories(githubRepositories, user.repositories);
    res.status(200).json({ status: 'success', data: sanitizedRepositories });
});

export const getMyRepositories = RepositoryFactory.getAll({
    middlewares: {
        pre: [async (req: IRequest): Promise<void> => { 
            req.query.user = req.user;
            req.query.populate = 'deployments container'; 
        }]
    },
    async responseInterceptor(req: IRequest, res: Response, body): Promise<void>{
        const user: any = req.user;
        const data = JSON.parse(JSON.stringify(body));
        for(const repo of data.data){
            const activeDeploymentId = repo.deployments[0];
            if(activeDeploymentId){
                const deployment = await Deployment.findById(activeDeploymentId).select('status');
                if(deployment) repo.activeDeployment = deployment;
            }
        }
        const enrichedData = await Promise.all(data.data.map(async (repo: IRepository) => {
            const github = new Github(user, repo);
            const repoInfo = await github.getRepositoryInfo();
            return repoInfo ? { ...repoInfo, ...repo } : null;
        }));
        res.status(200).json({
            status: 'success',
            ...body,
            data: enrichedData
        });
    }
});

// refactor this and avoid duplicated code with containers.
export const storageExplorer = catchAsync(async (req: IRequest, res: Response) => {
    const repository = await Repository.findById(req.params.id).populate('container');
    if(!repository){
        throw new RuntimeError('Repository::StorageExplorer::NotFound', 404);
    }
    const container = repository.container as IDockerContainer;
    const requestedPath = path.join(container.storagePath, req.params.route || '');
    const files = fs.readdirSync(requestedPath).map(file => ({
        name: file,
        isDirectory: fs.statSync(path.join(requestedPath, file)).isDirectory()
    }));
    res.status(200).json({ status: 'success', data: files });
});

export const updateRepositoryFile = catchAsync(async (req: IRequest, res: Response, next: NextFunction) => {
    const repository = await Repository.findById(req.params.id).populate('container');
    if(!repository){
        throw new RuntimeError('Repository::StorageExplorer::NotFound', 404);
    }
    const container = repository.container as IDockerContainer;
    const requestedPath = path.join(container.storagePath, req.params.route || '');
    if(!fs.existsSync(requestedPath)) return next(new RuntimeError('Repository::File::NotExists', 404));
    if(!req.body.content) return next(new RuntimeError('Repository::File::UpdateContentRequired', 400));
    fs.writeFileSync(requestedPath, req.body.content, 'utf-8');
    res.status(200).json({ status: 'success' });
});

export const readRepositoryFile = catchAsync(async (req: IRequest, res: Response) => {
    const repository = await Repository.findById(req.params.id).populate('container');
    if(!repository){
        throw new RuntimeError('Repository::StorageExplorer::NotFound', 404);
    }
    const container = repository.container as IDockerContainer;
    const requestedPath = path.join(container.storagePath, req.params.route || '');
    res.status(200).json({
        status: 'success',
        data: {
            name: path.basename(requestedPath),
            content: fs.readFileSync(requestedPath, 'utf-8')
        }
    });
});