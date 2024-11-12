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

import APIRequestBuilder from '@utilities/api/apiRequestBuilder';

/**
 * @constant ServerAPI
 * @description Represents the base endpoint for server-related API requests.
 * @type {APIRequestBuilder} An instance of the APIRequestBuilder utility.
*/
export const ServerAPI = new APIRequestBuilder('/server');

/**
 * @function getServerHealth
 * @description Fetches the health status of the Quantum Cloud server.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const getServerHealth = ServerAPI.register({
    path: '/health',
    method: 'GET'
});

export const getServerIP = ServerAPI.register({
    path: '/ip',
    method: 'GET'
});