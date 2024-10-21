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

export const ServerAPI = new APIRequestBuilder('/docker-container');

export const getMyDockerContainers = ServerAPI.register({
    path: '/me/',
    method: 'GET'
});

export const createDockerContainer = ServerAPI.register({
    path: '/',
    method: 'POST'
});

export const storageExplorer = ServerAPI.register({
    path: '/storage/:id/explore/:route/',
    method: 'GET'
});

export const getRandomAvailablePort = ServerAPI.register({
    path: '/random-available-port/',
    method: 'GET'
});

export const updateDockerContainer = ServerAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

export const readContainerFile = ServerAPI.register({
    path: '/storage/:id/read/:route/',
    method: 'GET'
});

export const updateContainerFile = ServerAPI.register({
    path: '/storage/:id/overwrite/:route/',
    method: 'POST'
});