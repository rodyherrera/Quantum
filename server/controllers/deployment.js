const Deployment = require('@models/deployment');
const Repository = require('@models/repository');
const HandlerFactory = require('@controllers/handlerFactory');
const RuntimeError = require('@utilities/runtimeError');
const Github = require('@utilities/github');
const { PTYHandler } = require('@utilities/ptyHandler');
const { catchAsync } = require('@utilities/runtime');

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

exports.getDeployments = DeploymentFactory.getAll();
exports.getDeployment = DeploymentFactory.getOne();
exports.createDeployment = DeploymentFactory.createOne();
exports.updateDeployment = DeploymentFactory.updateOne();
exports.deleteDeployment = DeploymentFactory.deleteOne();

const repositoryOperationHandler = async (repository, action) => {
    await repository.populate({
        path: 'user',
        select: 'username',
        populate: { path: 'github', select: 'accessToken username' }
    });
    const pty = new PTYHandler(repository._id, repository);
    const github = new Github(repository.user, repository);
    const currentDeploymentId = repository.deployments[0];
    const currentDeployment = await Deployment.findById(currentDeploymentId);
    const { githubDeploymentId } = currentDeployment;
    if(!currentDeployment)
        throw new RuntimeError('Deployment::Not::Found', 404);
    currentDeployment.status = 'queued';
    github.updateDeploymentStatus(githubDeploymentId, 'queued');
    await currentDeployment.save();
    switch(action){
        case 'restart':
            pty.removeFromRuntimeStoreAndKill();
            pty.startRepository(github);
            currentDeployment.status = 'success';
            // TODO: Can be refactored using mongoose middlewares
            github.updateDeploymentStatus(githubDeploymentId, 'success');
            break;
        case 'stop':
            pty.removeFromRuntimeStoreAndKill();
            currentDeployment.status = 'stopped';
            github.updateDeploymentStatus(githubDeploymentId, 'inactive');
            break;
        case 'start':
            pty.startRepository(github);
            currentDeployment.status = 'success';
            github.updateDeploymentStatus(githubDeploymentId, 'success');
            break;
        default:
            currentDeployment.status = 'success';
            currentDeployment.save();
            res.status(400).json({ 
                status: 'error', 
                message: 'Deployment::Invalid::Action' 
            });
            return;
    }
    await currentDeployment.save();
    return currentDeployment;
};

exports.repositoryOperations = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryAlias } = req.params;
    const repository = await Repository
        .findOne({ user: user._id, alias: repositoryAlias });
    if(!repository)
        throw new RuntimeError('Repository::Not::Found', 404);
    const { action } = req.body;
    if(!action)
        throw new RuntimeError('Repository::Action::Required', 400);
    const currentDeployment = await repositoryOperationHandler(repository, action);
    res.status(200).json({
        status: 'success', 
        data: { 
            status: currentDeployment.status, 
            repository 
        } 
    });
});

exports.getRepositoryDeployments = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryAlias } = req.params;
    const github = new Github(user, { name: repositoryAlias });
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

exports.deleteGithubDeployment = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryAlias, deploymentId } = req.params;
    const github = new Github(user, { name: repositoryAlias });
    await github.deleteRepositoryDeployment(deploymentId);
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

exports.getActiveDeploymentEnvironment = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryAlias } = req.params;
    const repository = await Repository
        .findOne({ alias: repositoryAlias, user: user._id })
        .select('deployments')
        .populate('deployments');
    if(!repository)
        throw new RuntimeError('Repository::Not::Found');
    // Is .slice(-1) the correct way of retrieve the last
    // item of deployments array?
    const activeDeployment = repository.deployments.pop();
    const { environment, _id } = activeDeployment;
    res.status(200).json({ status: 'success', data: { ...environment, _id } });
});