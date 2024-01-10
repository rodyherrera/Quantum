const Repository = require('@models/repository');
const { catchAsync } = require('@utilities/runtime');

exports.verifyRepositoryAccess = catchAsync(async (req, res, next) => {
    const { user } = req;
    if(user.role === 'admin')
        return next();
    const { id } = req.params;
    const repository = await Repository.findOne({ _id: id, user: user._id });
    if(!repository)
        throw new RuntimeError('Repository::NotFound', 404);
    next();
});