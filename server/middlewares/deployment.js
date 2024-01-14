const Deployment = require('@models/deployment');
const RuntimeError = require('@utilities/runtimeError');
const { catchAsync } = require('@utilities/runtime');

exports.verifyDeploymentAccess = catchAsync(async (req, res, next) => {
    const { user } = req;
    if(user.role === 'admin') return next();
    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, user: user._id });
    if(!deployment)
        throw new RuntimeError('Deployment::Not::Found', 404);
    next();
});