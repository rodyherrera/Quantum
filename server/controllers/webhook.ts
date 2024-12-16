import Repository from '@models/repository';
import User from '@models/user';
import RuntimeError from '@utilities/runtimeError';
import Github from '@services/github';
import RepositoryHandler from '@services/repositoryHandler';
import sendEmail from '@services/sendEmail';
import logger from '@utilities/logger';
import DockerContainerService from '@services/docker/container';
import { IDockerContainer } from '@typings/models/docker/container';
import { Request, Response } from 'express';
import { IUser } from '@typings/models/user';

/**
 * Fetches the repository details by ID.
 * @param {string} repositoryId - Repository ID.
 * @returns {Promise<any>} - The repository document.
*/
const fetchRepository = async (repositoryId: string) => {
    return Repository
        .findById(repositoryId)
        .populate({
            path: 'user',
            select: 'username email',
            populate: {
                path: 'github',
                select: 'accessToken username'
            }
        })
        .populate('container');
};

/**
 * Deploys a new version of the repository.
 * @param {any} repository - The repository document.
 * @param {Github} githubService - GitHub service instance.
 * @returns {Promise<any>} - The deployment document.
*/
const handleRepositoryDeployment = async (repository: any, githubService: Github) => {
    await Github.deleteLogAndDirectory('', repository.container.storagePath);
    return githubService.deployRepository();
};

/**
 * Updates the deployment records in the database.
 * @param {any} repository - The repository document.
 * @param {any} user - The user document.
 * @param {mongoose.Types.ObjectId} deploymentId - The deployment ID.
*/
const updateDeploymentRecords = async (repository: any, user: any, deploymentId: string) => {
    await Promise.all([
        User.updateOne({ _id: user._id }, { $push: { deployments: deploymentId } }),
        Repository.updateOne({ _id: repository._id }, { $push: { deployments: deploymentId } }),
    ]);
    repository.deployments.push(deploymentId);
};

/**
 * Sends an email notification about the successful deployment.
 * @param {string} email - Recipient email address.
 * @param {string} username - User's username.
 * @param {string} repositoryAlias - Repository alias.
 */
const sendDeploymentSuccessEmail = async (email: string, username: string, repositoryAlias: string) => {
    await sendEmail({
        to: email,
        subject: `Deployment for "${repositoryAlias}" completed successfully.`,
        html: `
            Hello @${username},<br><br>
            The "${repositoryAlias}" repository has been updated and we have deployed the new version. 
            It should be available in a few moments.<br><br>
            Regards.
        `,
    });
};

/**
 * Handles GitHub push event webhooks.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
*/
export const webhook = async (req: Request, res: Response) => {
    try{
        if(!req.body.pusher){
            return res.status(200).json({ status: 'success' });
        }

        const repositoryId = req.params.repositoryId;
        const repository = await fetchRepository(repositoryId);
        if(!repository) throw new RuntimeError('Repository::Not::Found', 404);

        const user = repository.user as IUser;
        const container = repository.container as IDockerContainer;

        const githubService = new Github(user, repository);
        const containerService = new DockerContainerService(container);

        await containerService.stop();
        const deployment = await handleRepositoryDeployment(repository, githubService);
        await updateDeploymentRecords(repository, user, deployment._id.toString());

        const repositoryHandler = new RepositoryHandler(repository);
        await repositoryHandler.start(githubService);

        await sendDeploymentSuccessEmail(user.email, user.username, repository.alias);
        
        res.status(200).json({ status: 'success' });
    }catch(error: any){
        logger.error('@controllers/webhook.ts: ' + error.message);
        res.status(500).json({ status: 'error' });
    }
};