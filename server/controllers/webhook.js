const Repository = require('@models/repository');
const User = require('@models/user');
const RuntimeError = require('@utilities/runtimeError');
const Github = require('@utilities/github');

// When a repository is registered on the platform, a webhook with the 
// "push" event is created in it. Therefore, we assume that when Github 
// sends a request to this place, it will be an update to 
// the repository. Therefore, we are going to re-deploy.
exports.webhook = async (req, res) => {
    const { pusher } = req.body;
    // In case "commit" and "pusher" are "undefined", it 
    // is nothing more than Github sending the request 
    // that the Webhook has been created.
    // Therefore, there is nothing to do, we return ;).
    try{
        if(!pusher){
            res.status(200).json({ status: 'success' });
            return;
        }
        const { repositoryId } = req.params;
        const requestedRepository = await Repository.findById(repositoryId);
        if(!requestedRepository) 
            throw new RuntimeError('Repository::Not::Found');
        const repositoryUser = await User.findById(requestedRepository.user).populate('github');
        const github = new Github(repositoryUser, requestedRepository);
        await Github.deleteLogAndDirectory(
            `${__dirname}/../storage/pty-log/${requestedRepository._id}.log`,
            `${__dirname}/../storage/repositories/${requestedRepository._id}/`
        );
        const deployment = await github.deployRepository();
        await User.updateOne({ _id: repositoryUser._id }, {
            $push: { deployments: deployment._id }
        });
        await Repository.updateOne({ _id: requestedRepository._id }, {
            $push: { deployments: deployment._id }
        });
        res.status(200).json({ status: 'success' });
    }catch(error){
        console.log('[Quantum Cloud] Critical Error (at @controllers/webhook):', error.message);
        res.status(500).json({ status: 'error' });
    }
};