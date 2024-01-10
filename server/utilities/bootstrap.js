const { capitalizeToLowerCaseWithDelimitier } = require('@utilities/algorithms');
const Repository = require('@models/repository');
const PTYHandler = require('@utilities/ptyHandler');

exports.standardizedBindingToApp = ({ app, routes, suffix, middlewares, settings }) => {
    middlewares.forEach((middleware) => app.use(middleware));
    routes.forEach((route) => {
        app.use(suffix + capitalizeToLowerCaseWithDelimitier(route), require(`../routes/${route}`));
    });
    settings.deactivated.forEach((deactivated) => app.disabled(deactivated));
};

exports.loadRepositoriesPTYs = async () => {
    console.log('[Quantum Cloud]: Loading repositories PTYs... (This may take a while).');
    console.log('[Quantum Cloud]: This is a one time process, after this, the repositories PTYs will be loaded on demand.');
    const repositories = await Repository.find().populate({ path: 'user', select: 'username' });
    console.log(`[Quantum Cloud]: Found ${repositories.length} repositories.`);
    for(const repository of repositories){
        global.ptyStore[repository._id] = PTYHandler.create(repository._id);
        const repositoryShell = new PTYHandler(repository._id, repository);
        repositoryShell.startRepository();
    }
    console.log('[Quantum Cloud]: Repositories PTYs loaded.');
};

module.exports = exports;