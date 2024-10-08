import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Repository from '@models/repository';
import HandlerFactory from '@controllers/common/handlerFactory';
import Deployment from '@models/deployment';
import Github from '@services/github';
import RuntimeError from '@utilities/runtimeError';
import { catchAsync } from '@utilities/helpers';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '@typings/models/user';

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

const getGithubRepositories = async (accessToken: string): Promise<any[]> => {
    const response = await axios.get('https://api.github.com/user/repos', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { visibility: 'all', per_page: 100 }
    });
    return response.data;
};

const filterRepositories = (githubRepositories: any[], userRepositories: any[]): any[] => 
    githubRepositories.filter(repo => !userRepositories.some(userRepo => userRepo.name === repo.full_name));

export const getMyGithubRepositories = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const githubRepositories = await getGithubRepositories(user.github.accessToken);
    const sanitizedRepositories = filterRepositories(githubRepositories, user.repositories);
    res.status(200).json({ status: 'success', data: sanitizedRepositories });
});

export const getMyRepositories = RepositoryFactory.getAll({
    middlewares: {
        pre: [(req) => { 
            req.query.populate = 'deployments'; 
        }]
    },
    async responseInterceptor(req, res, body) {
        const user = req.user as IUser;
        const data = JSON.parse(JSON.stringify(body));
        for(const repo of data.data){
            const activeDeploymentId = repo.deployments[0];
            if(activeDeploymentId){
                const deployment = await Deployment.findById(activeDeploymentId).select('status');
                if(deployment) repo.activeDeployment = deployment;
            }
        }
        const enrichedData = await Promise.all(data.data.map(async (repo) => {
            const github = new Github(user, repo);
            const repoInfo = await github.getRepositoryInfo();
            return repoInfo ? { ...repoInfo, ...repo } : null;
        }));
        res.status(200).json({ status: 'success', data: enrichedData.filter(Boolean) });
    }
});

const getRequestedPath = (req: Request): string => {
    const env = process.env.NODE_ENV || 'development';
    const user = req.user as IUser;
    return path.join('/var/lib/quantum', env, `/containers/${user._id}/github-repos/`, req.params.id, req.params.route || '');
};

export const storageExplorer = catchAsync(async (req: Request, res: Response) => {
    const requestedPath = getRequestedPath(req);
    const files = fs.readdirSync(requestedPath).map(file => ({
        name: file,
        isDirectory: fs.statSync(path.join(requestedPath, file)).isDirectory()
    }));
    res.status(200).json({ status: 'success', data: files });
});

export const updateRepositoryFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const requestedPath = getRequestedPath(req);
    if(!fs.existsSync(requestedPath)) return next(new RuntimeError('Repository::File::NotExists', 404));
    if(!req.body.content) return next(new RuntimeError('Repository::File::UpdateContentRequired', 400));
    fs.writeFileSync(requestedPath, req.body.content, 'utf-8');
    res.status(200).json({ status: 'success' });
});

export const readRepositoryFile = catchAsync(async (req: Request, res: Response) => {
    const requestedPath = getRequestedPath(req);
    res.status(200).json({
        status: 'success',
        data: {
            name: path.basename(requestedPath),
            content: fs.readFileSync(requestedPath, 'utf-8')
        }
    });
});