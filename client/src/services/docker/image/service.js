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

export const DockerImageAPI = new APIRequestBuilder('/docker-image');

export const createDockerImage = DockerImageAPI.register({
    path: '/',
    method: 'POST'
});

export const getMyDockerImages = DockerImageAPI.register({
    path: '/me/',
    method: 'GET'
});

export const deleteDockerImage = DockerImageAPI.register({
    path: '/:id/',
    method: 'DELETE'
});