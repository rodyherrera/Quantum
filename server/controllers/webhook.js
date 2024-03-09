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

const Repository = require('@models/repository');
const User = require('@models/user');
const RuntimeError = require('@utilities/runtimeError');
const Github = require('@utilities/github');
const RepositoryHandler = require('@utilities/repositoryHandler');

/**
 * Handles push event webhooks from GitHub.
 * This endpoint is triggered whenever a change is pushed to a registered repository.
 * The function performs the following:
 *  1. Verifies the webhook payload.
 *  2. Retrieves the relevant repository and user data.
 *  3. Handles potential errors (e.g., repository not found).
 *  4. Initiates a new deployment using the GitHub and RepositoryHandler utilities.
 *  5. Updates the user and repository models with the new deployment.
 *  6. Stops any existing container for the updated repository.
 *  7. Starts a new deployment container.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
*/
exports.webhook = async (req, res) => {
    try{
        // 1. Payload Verification
        const { pusher } = req.body;
        if(!pusher){
            // Acknowledge test webhook from GitHub
            res.status(200).json({ status: 'success' });
            return;
        }
        
        // 2. Data Retrieval
        const { repositoryId } = req.params;
        const requestedRepository = await Repository.findById(repositoryId);
        if(!requestedRepository){
            throw new RuntimeError('Repository::Not::Found');
        }
        const repositoryUser = await User.findById(requestedRepository.user).populate('github');

        // 3. Setup
        const github = new Github(repositoryUser, requestedRepository);

        // 4. Stop Existing Container (if any)
        const shellStream = global.userContainers[repositoryUser._id][requestedRepository._id];
        // Send Control-C for graceful termination
        if(shellStream) shellStream.write('\x03');

        // 5. Clean Up Old Deployment Artifacts
        // USE PATH HERE!!!!!!
        await Github.deleteLogAndDirectory(null, `/var/lib/quantum/${process.env.NODE_ENV}/containers/${repositoryUser._id}/github-repos/${requestedRepository._id}/`);

        // 6. Deploy new Version
        const deployment = await github.deployRepository();

        // 7. Update Database Records
        await User.updateOne({ _id: repositoryUser._id }, {
            $push: { deployments: deployment._id }
        });

        await Repository.updateOne({ _id: requestedRepository._id }, {
            $push: { deployments: deployment._id }
        });

        requestedRepository.deployments.push(deployment._id);

        // 8. Start the repository
        const repositoryHandler = new RepositoryHandler(requestedRepository, repositoryUser);
        await repositoryHandler.start(github);
        res.status(200).json({ status: 'success' });
    }catch(error){
        console.error('[Quantum Cloud] Critical Error (at @controllers/webhook):', error.message);
        res.status(500).json({ status: 'error' });
    }
};