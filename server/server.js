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

global.logStreamStore = {};
global.userContainers = {};

const { httpServer } = require('@config/express');
const mongoConnector = require('@utilities/mongoConnector');
const bootstrap = require('@utilities/bootstrap');

require('@config/ws');

const SERVER_PORT = process.env.SERVER_PORT || 8000;
const SERVER_HOST = process.env.SERVER_HOSTNAME || '0.0.0.0';

httpServer.listen(SERVER_PORT, SERVER_HOST, async () => {
    await mongoConnector();
    await bootstrap.loadUserContainers();
    await bootstrap.loadRepositoriesPTYs();
    console.log(`[Quantum Cloud]: Server running at http://${SERVER_HOST}:${SERVER_PORT}/.`);
});