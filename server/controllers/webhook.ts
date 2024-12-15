import Repository from '@models/repository';
import User from '@models/user';
import RuntimeError from '@utilities/runtimeError';
import Github from '@services/github';
import RepositoryHandler from '@services/repositoryHandler';
import logger from '@utilities/logger';
import { shells } from '@services/logManager';
import { Request, Response } from 'express';
import { IUser } from '@typings/models/user';
import mongoose from 'mongoose';
import DockerContainerService from '@services/docker/container';
import { IDockerContainer } from '@typings/models/docker/container';
import sendEmail from '@services/sendEmail';

/**
 * Handles push event webhooks from GitHub.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const webhook = async (req: Request, res: Response) => {
    try{
        const { pusher } = req.body;
        if(!pusher) return res.status(200).json({ status: 'success' });

        const { repositoryId } = req.params;
        const repository = await Repository
            .findById(repositoryId)
            .populate({
                path: 'user',
                select: 'username email',
                populate: { path: 'github', select: 'accessToken username' }
            })
            .populate('container');
        if(!repository) throw new RuntimeError('Repository::Not::Found', 404);
            
        const githubService = new Github(repository.user as IUser, repository);
        const container = repository.container as IDockerContainer;    

        const containerService = new DockerContainerService(container);
        await containerService.stop();

        // Clean up old deployment and deploy new version
        await Github.deleteLogAndDirectory('', container.storagePath);
        const deployment = await githubService.deployRepository();

        // Update database records
        await Promise.all([
            User.updateOne({ _id: repository.user._id }, { $push: { deployments: deployment._id } }),
            Repository.updateOne({ _id: repository._id }, { $push: { deployments: deployment._id } }),
        ]);

        repository.deployments.push(deployment._id as mongoose.Types.ObjectId);

        // Start the repository
        const repositoryHandler = new RepositoryHandler(repository);
        await repositoryHandler.start(githubService);

        sendEmail({
            to: repository.user.email,
            subject: `Deployment for "${repository.alias}" completed successfully.`,
            html: `Hello @${repository.user.username}. The "${repository.alias}" repository has been updated and we have deployed the new version. It should be available in a few moments.`
        });

        res.status(200).json({ status: 'success' });
    }catch(error: any){
        logger.error('@controllers/webhook.ts: ' + error.message);
        res.status(500).json({ status: 'error' });
    }
};