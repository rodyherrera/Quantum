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

const Repository = require('@models/repository');
const User = require('@models/user');
const Github = require('@utilities/github');
const fs = require('fs');
const path = require('path');
const UserContainer = require('@utilities/userContainer');
const RepositoryHandler = require('@utilities/repositoryHandler');
const nginxHandler = require('@utilities/nginxHandler');
const { capitalizeToLowerCaseWithDelimitier } = require('@utilities/algorithms');
const { spawn } = require('child_process');

/**
 * Asynchronously sets up an Nginx reverse proxy configuration.
 *
 * @returns {Promise<void>}
*/
exports.setupNginxReverseProxy = async () => {
    if(!process.env.RUNNING_IN_DOCKER) return;
    try{
        await nginxHandler.removeDomain('_');
        await nginxHandler.addDomain({
            domain: '_',
            ipv4: '127.0.0.1',
            port: process.env.SERVER_PORT
        });
    }catch(error){
        console.error('[Quantum Cloud] Error configuring reverse proxy:', error);
    }
};

/**
 * Ensures the existence of the "../public" folder, creating it if necessary.
 * 
 * @returns {Promise<void>}
*/
exports.ensurePublicFolderExistence = async () => {
    const publicFolderPath = path.join(__dirname, '../public');
    try{
        await fs.promises.access(publicFolderPath, fs.constants.F_OK); // Check existence efficiently
    }catch(error){
        await fs.promises.mkdir(publicFolderPath);
    }
};

/**
 * Configures the Express application with provided routes, middlewares, and settings.
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.app - The Express application instance.
 * @param {Array} options.routes - Array of route names.
 * @param {string} options.suffix - Base route suffix for the configured routes.
 * @param {Array} options.middlewares - Array of middleware functions.
 * @param {Object} options.settings - Settings for enabling/disabling app features.
*/
exports.configureApp = ({ app, routes, suffix, middlewares, settings }) => {
    middlewares.forEach((middleware) => app.use(middleware));
    routes.forEach((route) => {
        const path = suffix + capitalizeToLowerCaseWithDelimitier(route);
        const router = require(`../routes/${route}`);
        app.use(path, router);
    });
    settings.deactivated.forEach((deactivated) => app.disabled(deactivated));
};

/**
 * Restarts the Node.js server by spawning a new process. Terminates the current process after spawning new one.
*/
exports.restartServer = async () => {
    // "stdio: 'inherit'" -> Inherit standard flows from the main process.
    const childProcess = spawn('npm', ['run', 'start'], { stdio: 'inherit' });
    childProcess.on('close', (code) => {
        console.log(`[Quantum Cloud]: Server process exited with code ${code}.`);
    });
};

/**
 * Loads and initializes Docker containers for all registered users.
 *
 * @returns {Promise<void>}
*/
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

/**
 * Initializes repositories on the platform by cloning and building them.
 *
 * @returns {Promise<void>}
*/
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

/**
 * Validates required environment variables and ensures compliance with format restrictions. 
 * Exits the process if any validation fails.
*/
exports.validateEnvironmentVariables = () => {
    const requiredVariables = [
        { name: 'NODE_ENV', validation: /^(development|production)$/i, errorMessage: 'NODE_ENV must be one of "development", "production", or "test".' },
        { name: 'DOCKERS_CONTAINER_ALIASES' },
        { name: 'DOCKER_APK_STARTER_PACKAGES' },
        { name: 'DOMAIN', validation: /^http(s)?:\/\/\S+$/, errorMessage: 'DOMAIN must be a valid URL starting with "http://" or "https://"' },
        { name: 'SECRET_KEY' },
        { name: 'REGISTRATION_DISABLED', validation: /^(true|false)$/i, errorMessage: 'REGISTRATION_DISABLED must be either "true" or "false".' },
        { name: 'CLIENT_HOST', validation: /^http(s)?:\/\/\S+$/, errorMessage: 'CLIENT_HOST must be a valid URL starting with "http://" or "https://"' },
        { name: 'SERVER_PORT', validation: /^\d+$/, errorMessage: 'SERVER_PORT must be a valid port number between 1 and 65535.' },
        { name: 'SERVER_HOSTNAME' },
        { name: 'SESSION_SECRET' },
        { name: 'GITHUB_CLIENT_ID' },
        { name: 'GITHUB_CLIENT_SECRET' },
        { name: 'JWT_EXPIRATION_DAYS', validation: /^(\d+d|\d+h)$/i, errorMessage: 'JWT_EXPIRATION_DAYS must be in the format of "Xd" for days or "Xh" for hours, where X is a number.' },
        { name: 'CORS_ORIGIN' },
        { name: 'PRODUCTION_DATABASE' },
        { name: 'DEVELOPMENT_DATABASE' },
        { name: 'LOG_PATH_MAX_SIZE', validation: /^\d+$/, errorMessage: 'LOG_PATH_MAX_SIZE must be a positive integer representing size in kilobytes.' },
        { name: 'MONGO_URI', validation: /^mongodb(?:\+srv)?:\/\/\S+$/, errorMessage: 'MONGO_URI must be a valid MongoDB connection URI.' }
    ];

    const missingVariables = [];
    requiredVariables.forEach((variable) => {
        if(!(variable.name in process.env)){
            missingVariables.push(variable.name);
        }else if(variable.validation && !variable.validation.test(process.env[variable.name])){
            console.error(`[Quantum Cloud]: ${variable.errorMessage}`);
            process.exit(1);
        }
    });
    
    if(missingVariables.length > 0){
        console.error('[Quantum Cloud]: The following environment variables are missing:');
        console.error(missingVariables.join(', '));
        process.exit(1);
    }

    console.log('[Quantum Cloud]: All environment variables are present and valid. Continuing with the server initialization.');
};

module.exports = exports;