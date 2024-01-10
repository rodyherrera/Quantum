const { catchAsync } = require('@utilities/runtime');
const Github = require('@models/github');
const HandlerFactory = require('@controllers/handlerFactory');

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

exports.getAccounts = GithubFactory.getAll();
exports.getAccount = GithubFactory.getOne();
exports.createAccount = GithubFactory.createOne();
exports.updateAccount = GithubFactory.updateOne();
exports.deleteAccount = GithubFactory.deleteOne();

exports.authCallback = catchAsync(async (req, res) => {
    const { accessToken, profile } = req.user;
    res.redirect(`${process.env.CLIENT_HOST}/github/authenticate/?accessToken=${accessToken}&profile=${JSON.stringify(profile)}`);
});