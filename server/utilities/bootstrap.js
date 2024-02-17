/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

const { capitalizeToLowerCaseWithDelimitier } = require('@utilities/algorithms');
const { PTYHandler } = require('@utilities/ptyHandler');
const Repository = require('@models/repository');
const User = require('@models/user');
const Github = require('@utilities/github');
const UserContainer = require('@utilities/userContainer');
const RepositoryHandler = require('@utilities/repositoryHandler');

exports.standardizedBindingToApp = ({ app, routes, suffix, middlewares, settings }) => {
    middlewares.forEach((middleware) => app.use(middleware));
    routes.forEach((route) => {
        const path = suffix + capitalizeToLowerCaseWithDelimitier(route);
        const router = require(`../routes/${route}`);
        app.use(path, router);
    });
    settings.deactivated.forEach((deactivated) => app.disabled(deactivated));
};

exports.loadUserContainers = async () => {
    console.log('[Quantum Cloud]: Loading users docker containers...');
    const users = await User.find().select('_id');
    console.log(`[Quantum Cloud]: Found ${users.length} users.`);
    for(const user of users){
        const container = new UserContainer(user);
        await container.start();
    }
    console.log('[Quantum Cloud]: User containers loaded.');
};

exports.loadRepositoriesPTYs = async () => {
    console.log('[Quantum Cloud]: Loading repositories PTYs... (This may take a while).');
    console.log('[Quantum Cloud]: This is a one time process, after this, the repositories PTYs will be loaded on demand.');
    const repositories = await Repository.find()
        .populate({ 
            path: 'user', 
            select: 'username',
            populate: { path: 'github', select: 'accessToken username' }
        });
    console.log(`[Quantum Cloud]: Found ${repositories.length} repositories.`);
    for(const repository of repositories){
        const repositoryHandler = new RepositoryHandler(repository, repository.user);
        const github = new Github(repository.user, repository);
        repositoryHandler.start(github);
    }
    console.log('[Quantum Cloud]: Repositories PTYs loaded.');
};

module.exports = exports;