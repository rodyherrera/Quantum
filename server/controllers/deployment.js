const Deployment = require('@models/deployment');
const Repository = require('@models/repository');
const HandlerFactory = require('@controllers/handlerFactory');
const RuntimeError = require('@utilities/runtimeError');
const Github = require('@utilities/github');
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

exports.getRepositoryDeployments = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryName } = req.params;
    const github = new Github(user, { name: repositoryName });
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

exports.deleteGithubDeployment = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryName, deploymentId } = req.params;
    const github = new Github(user, { name: repositoryName });
    await github.deleteRepositoryDeployment(deploymentId);
    const deployments = await github.getRepositoryDeployments();
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});

exports.getActiveDeploymentEnvironment = catchAsync(async (req, res) => {
    const { user } = req;
    const { repositoryName } = req.params;
    const repository = await Repository
        .findOne({ name: repositoryName, user: user._id })
        .select('deployments')
        .populate('deployments');
    if(!repository)
        throw new RuntimeError('Repository::Not::Found');
    const activeDeployment = repository.deployments[0];
    const { environment, _id } = activeDeployment;
    res.status(200).json({ status: 'success', data: { ...environment, _id } });
});