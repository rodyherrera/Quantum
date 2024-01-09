const { capitalizeToLowerCaseWithDelimitier } = require('./algorithms');
const Repository = require('../models/repository');
const PTY = require('../utilities/ptyHandler');

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
    const repositories = await Repository.find();
    console.log(`[Quantum Cloud]: Found ${repositories.length} repositories.`);
    for(const repository of repositories){
        global.ptyStore[repository._id] = PTY.create(repository._id);
    }
    console.log('[Quantum Cloud]: Repositories PTYs loaded.');
};

module.exports = exports;