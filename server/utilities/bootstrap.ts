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
import PortBinding from '@models/portBinding';
import sendMail from '@services/sendEmail';
import logger from '@utilities/logger';
import { createProxyServer } from '@services/proxyServer';
import { ConfigureAppParams } from '@typings/utilities/bootstrap';
import { spawn } from 'child_process';
import { IUser } from '@typings/models/user';
import { IRepository } from '@typings/models/repository';
import * as nginxHandler from '@services/nginx';
import { IPortBinding } from '@typings/models/portBinding';
import { IDockerContainer } from '@typings/models/docker/container';

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
        logger.error('@utilities/bootstrap.ts (setupNginxReverseProxy): Error configuring reverse proxy ' + error);
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
            const path = suffix + route.replace(/\//g, '-').split(/(?=[A-Z])/).join('-').toLowerCase();
            const router = require(`@routes/${route}.ts`);
            if(router.default){
                app.use(path, router.default);
            }else{
                logger.error(`@utilities/bootstrap.ts (configureApp): The module imported from './routes/${route}' does not have a default export.`);
            }
        });
        await Promise.all(routePromises);
    }catch(error){
        logger.error('@utilities/bootstrap.ts (configureApp): Error setting up the application routes ' + error);
    }
};

/**
 * Restarts the Node.js server by spawning a new process. Terminates the current process after spawning new one.
*/
export const restartServer = async (): Promise<void> => {
    // "stdio: 'inherit'" -> Inherit standard flows from the main process.
    const childProcess = spawn('npm', ['run', 'start'], { stdio: 'inherit' });
    childProcess.on('close', (code) => {
        logger.info(`@utilities/bootstrap.ts (restartServer): Server process exited with code ${code}.`);
    });
};

export const loadReverseProxies = async (): Promise<void> => {
    try{
        logger.info('@utilities/bootstrap.ts (loadReverseProxies): Loading reverse proxies...');
        const portBindings = await PortBinding
            .find()
            .select('internalPort ipAddress container externalPort -_id')
            .populate({
                path: 'container',
                select: 'ipAddress -_id'
            });
        await Promise.all(portBindings.map(({ internalPort, externalPort, container }) => {
            createProxyServer(externalPort as number, (container as IDockerContainer).ipAddress as string, internalPort);
        }));
    }catch(error){
        logger.error('@utilities/bootstrap.ts (loadReverseProxies): ' + error);
    }
};

/**
 * Loads and initializes Docker containers for all registered users.
 *
 * @returns {Promise<void>}
*/
export const loadUserContainers = async (): Promise<void> => {
    try{
        logger.info('@utilities/bootstrap.ts (loadUserContainers): Loading users docker containers...');
        const users = await User.find().populate('container');
        logger.info(`@utilities/bootstrap.ts (loadUserContainers): Found ${users.length} users.`);
        await Promise.all(users.map(async (user) => {
            const container = new UserContainer(user);
            await container.start();
        }));
        await sendMail({
            subject: "Let's gooo, user containers loaded correctly!",
            html: 'The containers of all users registered on the platform were successfully mounted on the host.'
        });
    }catch(error){
        logger.error('@utilities/bootstrap.ts (loadUserContainers):' + error);
    }
};

/**
 * Initializes repositories on the platform by cloning and building them.
 *
 * @returns {Promise<void>}
*/
export const initializeRepositories = async (): Promise<void> => {
    try{
        logger.info('@utilities/bootstrap.ts (initializeRepositories): Initializing the repositories loaded on the platform...');
        logger.info('@utilities/bootstrap.ts (initializeRepositories): This is a one time process, after this, the repositories will be loaded on demand.');
        const repositories = await Repository.find()
            .populate({
                path: 'user',
                select: 'username',
                populate: { path: 'github', select: 'accessToken username' }
            });
        logger.info(`@utilities/bootstrap.ts (initializeRepositories): Found ${repositories.length} repositories.`);
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
        logger.info('@utilities/bootstrap.ts (initializeRepositories): All repositories were initialized.');
    }catch(error){
        logger.error('@utilities/bootstrap.ts (initializeRepositories): ' + error);
    }
};

/**
 * Validates required environment variables and ensures compliance with format restrictions. 
 * Exits the process if any validation fails.
*/
export const validateEnvironmentVariables = (): void => {
    const requiredVariables = [
        { name: 'NODE_ENV', validation: /^(development|production)$/i, errorMessage: 'NODE_ENV must be one of "development", "production", or "test".' },
        { name: 'DOCKER_APK_STARTER_PACKAGES' },
        { name: 'DOMAIN', validation: /^http(s)?:\/\/\S+$/, errorMessage: 'DOMAIN must be a valid URL starting with "http://" or "https://"' },
        { name: 'SECRET_KEY' },
        { name: 'REGISTRATION_DISABLED', validation: /^(true|false)$/i, errorMessage: 'REGISTRATION_DISABLED must be either "true" or "false".' },
        { name: 'CLIENT_HOST', validation: /^http(s)?:\/\/\S+$/, errorMessage: 'CLIENT_HOST must be a valid URL starting with "http://" or "https://"' },
        { name: 'CLIENT_DEV_HOST', validation: /^http(s)?:\/\/\S+$/, errorMessage: 'CLIENT_DEV_HOST must be a valid URL starting with "http://" or "https://"' },
        { name: 'SERVER_PORT', validation: /^\d+$/, errorMessage: 'SERVER_PORT must be a valid port number between 1 and 65535.' },
        { name: 'SERVER_HOSTNAME' },
        { name: 'LOG_LEVEL' },
        { name: 'SESSION_SECRET' },
        { name: 'GITHUB_CLIENT_ID' },
        { name: 'GITHUB_CLIENT_SECRET' },
        { name: 'SERVER_IP', validation: /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/, errorMessage: 'SERVER_IP must be a valid IPv4 address.' },
        { name: 'JWT_EXPIRATION_DAYS', validation: /^[-+]?\d+$/, errorMessage: 'JWT_EXPIRATION_DAYS must be a number.' },
        { name: 'CORS_ORIGIN' },
        { name: 'PRODUCTION_DATABASE' },
        { name: 'DEVELOPMENT_DATABASE' },
        { name: 'LOG_PATH_MAX_SIZE', validation: /^\d+$/, errorMessage: 'LOG_PATH_MAX_SIZE must be a positive integer representing size in kilobytes.' },
        { name: 'MONGO_URI', validation: /^mongodb(?:\+srv)?:\/\/\S+$/, errorMessage: 'MONGO_URI must be a valid MongoDB connection URI.' },
        { name: 'ENCRYPTION_KEY', validation: /^[0-9a-fA-F]{64}$/, errorMessage: 'ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes). Use https://www.browserling.com/tools/random-hex.' },
        { name: 'ENCRYPTION_IV', validation: /^[0-9a-fA-F]{32}$/, errorMessage: 'ENCRYPTION_IV must be a 32-character hexadecimal string (16 bytes). Use https://www.browserling.com/tools/random-hex.' }
    ];

    const missingVariables: string[] = [];
    requiredVariables.forEach((variable) => {
        if(!(variable.name in process.env)){
            missingVariables.push(variable.name);
        }else if(variable.validation && !variable.validation.test(process.env[variable.name]!)){
            logger.error(`@utilities/bootstrap.ts (validateEnvironmentVariables): ${variable.errorMessage}`);
            process.exit(1);
        }
    });
    
    if(missingVariables.length > 0){
        logger.error('@utilities/bootstrap.ts (validateEnvironmentVariables): The following environment variables are missing:');
        logger.error(missingVariables.join(', '));
        process.exit(1);
    }

    logger.info('@utilities/bootstrap.ts (validateEnvironmentVariables): All environment variables are present and valid. Continuing with the server initialization.');
};