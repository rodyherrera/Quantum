const Repository = require('@models/repository');
const User = require('@models/user');
const Github = require('@utilities/github');
const UserContainer = require('@utilities/userContainer');
const RepositoryHandler = require('@utilities/repositoryHandler');
const { capitalizeToLowerCaseWithDelimitier } = require('@utilities/algorithms');

exports.configureApp = ({ app, routes, suffix, middlewares, settings }) => {
    middlewares.forEach((middleware) => app.use(middleware));
    routes.forEach((route) => {
        const path = suffix + capitalizeToLowerCaseWithDelimitier(route);
        const router = require(`../routes/${route}`);
        app.use(path, router);
    });
    settings.deactivated.forEach((deactivated) => app.disabled(deactivated));
};

exports.loadUserContainers = async () => {
    try{
        console.log('[Quantum Cloud]: Loading users docker containers...');
        const users = await User.find().select('_id');
        console.log(`[Quantum Cloud]: Found ${users.length} users.`);
        await Promise.all(users.map(async (user) => {
            const container = new UserContainer(user);
            await container.start();
        }));
    }catch(error){
        console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/bootstrap - loadUserContainers):', error);
    }
};

exports.initializeRepositories = async () => {
    try{
        console.log('[Quantum Cloud]: Initializing the repositories loaded on the platform...');
        console.log('[Quantum Cloud]: This is a one time process, after this, the repositories will be loaded on demand.');
        const repositories = await Repository.find()
            .populate({
                path: 'user',
                select: 'username',
                populate: { path: 'github', select: 'accessToken username' }
            });
        console.log(`[Quantum Cloud]: Found ${repositories.length} repositories.`);
        await Promise.all(repositories.map(async (repository) => {
            const repositoryHandler = new RepositoryHandler(repository, repository.user);
            const github = new Github(repository.user, repository);
            await repositoryHandler.start(github);
        }));
        console.log('[Quantum Cloud]: All repositories were initialized.');
    }catch(error){
        console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/bootstrap - initializeRepositories):', error);
    }
};

module.exports = exports;