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

require('./aliases');

/**
 * Temporary global storage for log streams.
 * @global
 * @todo Replace with Redis or a similar tool for scalability in a later version.
*/
global.logStreamStore = {};

/**
 * Temporary storage for user container information.
 * @global
 * @todo Replace with a persistent solution (e.g., database) in a later version.
*/
global.userContainers = {};

const { httpServer } = require('@config/express'); 
const { sendMail } = require('@utilities/mailHandler');
const { cleanHostEnvironment } = require('@utilities/runtime');
const mongoConnector = require('@utilities/mongoConnector');
const bootstrap = require('@utilities/bootstrap');

require('@config/ws');

// Server configuration
const SERVER_PORT = process.env.SERVER_PORT || 8000;
const SERVER_HOST = process.env.SERVER_HOSTNAME || '0.0.0.0';

/**
 * Handles uncaught exceptions, cleans the environment, and restarts the server. 
 * @param {Error} err - The uncaught exception.
*/
process.on('uncaughtException', async (err) => {
    console.error('[Quantum Cloud]: Uncaught Exception:', err);
    await cleanHostEnvironment();
    console.log('[Quantum Cloud]: Restarting server...');
    await bootstrap.restartServer();
});

/**
 * Handles unhandledRejection and print in console.
 * @param {String} reason - The unhandled rejection.
*/
process.on('unhandledRejection', (reason) => {
    console.error('[Quantum Cloud]: Unhandled Promise Rejection, reason:', reason);
});

/**
 * Handles SIGINT (Ctrl-C) for graceful shutdown.
*/
process.on('SIGINT', async () => {
    console.log('[Quantum Cloud]: SIGINT signal received, shutting down...');
    await cleanHostEnvironment();
    await sendMail({
        subject: 'Quantum and hosted services have stopped successfully.',
        html: 'The server has safely completed execution. A certain signal has been received and all services hosted on the platform have been terminated. After sending this email, the server will be closed. See you later!'
    });
    process.exit(0);
});

// Starts the HTTP Server
httpServer.listen(SERVER_PORT, SERVER_HOST, async () => {
    try{
        // Manages Nginx configuration for proxying
        bootstrap.setupNginxReverseProxy();
        // Ensures necessary environment variables exist
        bootstrap.validateEnvironmentVariables();
        // Establishes a connection to the MongoDB database
        await mongoConnector();
        console.log('[Quantum Cloud]: Docker containers and user applications will be started. This may take a few minutes...');
        // Loads user-defined Docker containers
        await bootstrap.loadUserContainers();
        // Initializes user repositories (presumably for Git interaction)
        await bootstrap.initializeRepositories();
        // Email to WEBMASTER_MAIL to notify about the correct opening of the server.
        await sendMail({
            subject: 'The Quantum API is now accessible!',
            html: 'Your instance has been successfully deployed within your server.'
        });
        console.log(`[Quantum Cloud]: Server running at http://${SERVER_HOST}:${SERVER_PORT}/.`);
    }catch(error){
        console.error('[Quantum Cloud]: Error during server initialization:', error);
        process.exit(1);
    }
});