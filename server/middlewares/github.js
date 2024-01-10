const passport = require('passport');
const RuntimeError = require('@utilities/runtimeError');

exports.authenticate = (req, res, next) => {
    if(!req.query.userId){
        return next(new RuntimeError('Github::Missing::UserId', 400));
    }
    const userId = req.query.userId;
    req.session.userId = userId;
    passport.authenticate('github', { scope: ['user', 'repo'] })(req, res, next);
};

exports.populateGithubAccount = async (req, res, next) => {
    req.user = await req.user.populate('github');
    next();
};

exports.populateRepositories = async (req, res, next) => {
    req.user = await req.user.populate('repositories');
    next();
};

exports.authenticateCallback = passport.authenticate('github',  { failureRedirect: '/' });

module.exports = exports;