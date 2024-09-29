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
export const ServerAPI = new APIRequestBuilder('/port-binding');

export const getMyPortBindings = ServerAPI.register({
    path: '/me/',
    method: 'GET'
});

export const createPortBinding = ServerAPI.register({
    path: '/',
    method: 'POST'
});