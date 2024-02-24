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

import APIRequestBuilder from '@utilities/apiRequestBuilder';
export const DeploymentAPI = new APIRequestBuilder('/deployment');

export const getRepositoryDeployments = DeploymentAPI.register({
    path: '/repository/:repositoryName/',
    method: 'GET'
});

export const deleteRepositoryDeployment = DeploymentAPI.register({
    path: '/repository/:repositoryName/:deploymentId',
    method: 'DELETE'
});

export const getActiveDeploymentEnvironment = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/environment/',
    method: 'GET'
});

export const updateDeployment = DeploymentAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

export const repositoryOperations = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/actions/',
    method: 'POST'
});