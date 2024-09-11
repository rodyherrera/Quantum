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

import Repository from '@models/repository';
import User from '@models/user';
import Github from '@services/github';
import fs from 'fs';
import path from 'path';
import UserContainer from '@services/userContainer';
import RepositoryHandler from '@services/repositoryHandler';
import { ConfigureAppParams } from '@typings/utilities/bootstrap';
import { spawn } from 'child_process';
import { sendMail } from '@services/mailHandler';
import { IUser } from '@typings/models/user';
import { IRepository } from '@typings/models/repository';
import * as nginxHandler from '@services/nginxHandler';

/**
 * Asynchronously sets up an Nginx reverse proxy configuration.
 *
 * @returns {Promise<void>}
*/
export const setupNginxReverseProxy = async (): Promise<void> => {
    if(!process.env.RUNNING_IN_DOCKER) return;
    try{
        await nginxHandler.removeDomain('_');
        await nginxHandler.addDomain({
            domain: '_',
            ipv4: '127.0.0.1',
            port: Number(process.env.SERVER_PORT) || 8000
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
export const ensurePublicFolderExistence = async (): Promise<void> => {
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
export const configureApp = async ({ app, routes, suffix, middlewares }: ConfigureAppParams): Promise<void> => {
    middlewares.forEach((middlewares) => app.use(middlewares));
    try{
        const routePromises = routes.map(async (route) => {
            const path = suffix + route.split(/(?=[A-Z])/).join('-').toLowerCase();
            const router = require(`@routes/${route}.ts`);
            if(router.default){
                app.use(path, router.default);
            }else{
                console.error(`The module imported from './routes/${route}' does not have a default export.`);
            }
        });
        await Promise.all(routePromises);
    }catch(error){
        console.error('[Quantum Cloud] -> Error setting up the application routes:', error);
    }
};

/**
 * Restarts the Node.js server by spawning a new process. Terminates the current process after spawning new one.
*/
export const restartServer = async (): Promise<void> => {
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
export const loadUserContainers = async (): Promise<void> => {
    try{
        console.log('[Quantum Cloud]: Loading users docker containers...');
        const users = await User.find().select('_id');
        console.log(`[Quantum Cloud]: Found ${users.length} users.`);
        await Promise.all(users.map(async (user) => {
            const container = new UserContainer(user);
            await container.start();
        }));
        await sendMail({
            subject: "Let's gooo, user containers loaded correctly!",
            html: 'The containers of all users registered on the platform were successfully mounted on the host.'
        });
    }catch(error){
        console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/bootstrap - loadUserContainers):', error);
    }
};

/**
 * Initializes repositories on the platform by cloning and building them.
 *
 * @returns {Promise<void>}
*/
export const initializeRepositories = async (): Promise<void> => {
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
        await Promise.all(repositories.map(async (repository: IRepository) => {
            const user = repository.user as IUser;
            const repositoryHandler = new RepositoryHandler(repository, user);
            const github = new Github(user, repository);
            await repositoryHandler.start(github);
        }));
        await sendMail({
            subject: 'All repositories accessible now!',
            html: 'The repositories were correctly initialized, within a few minutes if not now, they should be accessible to everyone.'
        });
        console.log('[Quantum Cloud]: All repositories were initialized.');
    }catch(error){
        console.log('[Quantum Cloud] CRITICAL ERROR (at @utilities/bootstrap - initializeRepositories):', error);
    }
};

/**
 * Validates required environment variables and ensures compliance with format restrictions. 
 * Exits the process if any validation fails.
*/
export const validateEnvironmentVariables = (): void => {
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

    const missingVariables: string[] = [];
    requiredVariables.forEach((variable) => {
        if(!(variable.name in process.env)){
            missingVariables.push(variable.name);
        }else if(variable.validation && !variable.validation.test(process.env[variable.name]!)){
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