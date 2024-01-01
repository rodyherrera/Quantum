const Deployment = require('../models/deployment');
const HandlerFactory = require('./handlerFactory');
const RuntimeError = require('../utilities/runtimeError');
const { catchAsync } = require('../utilities/runtime');
const { getRepositoryDeployments } = require('../utilities/github');

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
    const deployments = await getRepositoryDeployments(user, repositoryName);
    if(!deployments)
        throw new RuntimeError('Deployment::Not::Found', 404);
    res.status(200).json({ status: 'success', data: deployments });
});