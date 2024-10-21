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

export const DockerContainerAPI = new APIRequestBuilder('/docker-container');

export const getMyDockerContainers = DockerContainerAPI.register({
    path: '/me/',
    method: 'GET'
});

export const createDockerContainer = DockerContainerAPI.register({
    path: '/',
    method: 'POST'
});

export const storageExplorer = DockerContainerAPI.register({
    path: '/storage/:id/explore/:route/',
    method: 'GET'
});

export const getRandomAvailablePort = DockerContainerAPI.register({
    path: '/random-available-port/',
    method: 'GET'
});

export const updateDockerContainer = DockerContainerAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

export const readContainerFile = DockerContainerAPI.register({
    path: '/storage/:id/read/:route/',
    method: 'GET'
});

export const updateContainerFile = DockerContainerAPI.register({
    path: '/storage/:id/overwrite/:route/',
    method: 'POST'
});