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

export const DockerNetworkAPI = new APIRequestBuilder('/docker-network');

export const createDockerNetwork = DockerNetworkAPI.register({
    path: '/',
    method: 'POST'
});

export const getMyDockerNetworks = DockerNetworkAPI.register({
    path: '/me/',
    method: 'GET'
});

export const deleteDockerNetwork = DockerNetworkAPI.register({
    path: '/:id/',
    method: 'DELETE'
});