import Repository from '@models/repository';
import User from '@models/user';
import RuntimeError from '@utilities/runtimeError';
import Github from '@services/github';
import RepositoryHandler from '@services/repositoryHandler';
import logger from '@utilities/logger';
import { shells } from '@services/logManager';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

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
        const requestedRepository = await Repository.findById(repositoryId) as IRepository;
        if(!requestedRepository) throw new RuntimeError('Repository::Not::Found', 404);

        const repositoryUser = await User.findById(requestedRepository.user).populate('github') as IUser;
        const github = new Github(repositoryUser, requestedRepository);

        // Stop existing container if running
        const shell = shells.get(repositoryId);
        if(shell){
            shell.write('\x03');
            shell.end();
        }

        // Clean up old deployment and deploy new version
        await Github.deleteLogAndDirectory('', `/var/lib/quantum/${process.env.NODE_ENV}/containers/${repositoryUser._id}/github-repos/${requestedRepository._id}/`);
        const deployment = await github.deployRepository();

        // Update database records
        await Promise.all([
            User.updateOne({ _id: repositoryUser._id }, { $push: { deployments: deployment._id } }),
            Repository.updateOne({ _id: requestedRepository._id }, { $push: { deployments: deployment._id } }),
        ]);

        requestedRepository.deployments.push(deployment._id as mongoose.Types.ObjectId);

        // Start the repository
        const repositoryHandler = new RepositoryHandler(requestedRepository, repositoryUser);
        await repositoryHandler.start(github);

        res.status(200).json({ status: 'success' });
    }catch(error: any){
        logger.error('@controllers/webhook.ts: ' + error.message);
        res.status(500).json({ status: 'error' });
    }
};