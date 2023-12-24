const { catchAsync } = require('../utilities/runtime');
const Github = require('../models/github');
const HandlerFactory = require('./handlerFactory');

const GithubFactory = new HandlerFactory({
    model: Github,
    fields: [
        'user',
        'githubId',
        'accessToken',
        'username',
        'avatarUrl'
    ]
});

exports.getAccounts = GithubFactory.getAll;
exports.getAccount = GithubFactory.getOne;
exports.createAccount = GithubFactory.createOne;
exports.updateAccount = GithubFactory.updateOne;
exports.deleteAccount = GithubFactory.deleteOne;

exports.authCallback = catchAsync(async (req, res) => {
    const { accessToken, profile, refreshToken } = req.user;
    res.status(200).json({
        accessToken,
        profile,
        refreshToken
    });
});