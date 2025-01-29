import Repository from '@models/repository';
import HandlerFactory from '@controllers/common/handlerFactory';
import Deployment from '@models/deployment';
import Github from '@services/github';
import { catchAsync } from '@utilities/helpers';
import { Response } from 'express';
import { IRepository } from '@typings/models/repository';
import { IRequest } from '@typings/controllers/common';
import { Octokit } from '@octokit/rest';

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
        'port', 
        'installCommand', 
        'branch',
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
    const octokit = new Octokit({ auth: accessToken });

    const repos = await octokit.paginate(
        octokit.rest.repos.listForAuthenticatedUser,
        { visibility: 'all', per_page: 100 }
    );

    const reposWithBranches = await Promise.all(
        repos.map(async repo => {
            const branches = await octokit.paginate(
                octokit.rest.repos.listBranches,
                { owner: repo.owner.login, repo: repo.name, per_page: 100 }
            );
            return { ...repo, branches: branches.map(b => b.name) };
        })
    );

    return reposWithBranches;
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