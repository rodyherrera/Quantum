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

/**
 * @constant DeploymentAPI
 * @description Represents the base endpoint for deployment-related API requests.
 * @type {APIRequestBuilder} An instance of the APIRequestBuilder utility.
*/
export const DeploymentAPI = new APIRequestBuilder('/deployment');

/**
 * @function getRepositoryDeployments
 * @description Fetches a list of deployments associated with a repository.
 * @param {string} repositoryName - The name of the repository.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const getRepositoryDeployments = DeploymentAPI.register({
    path: '/repository/:repositoryName/',
    method: 'GET'
});

/**
 * @function deleteRepositoryDeployment
 * @description Deletes a specific deployment for a repository.
 * @param {string} repositoryName - The name of the repository.
 * @param {string} deploymentId - The ID of the deployment to delete.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const deleteRepositoryDeployment = DeploymentAPI.register({
    path: '/repository/:repositoryName/:deploymentId',
    method: 'DELETE'
});

/**
 * @function getActiveDeploymentEnvironment
 * @description Retrieves the active deployment environment for a repository.
 * @param {string} repositoryAlias - The unique alias of the repository.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const getActiveDeploymentEnvironment = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/environment/',
    method: 'GET'
});

/**
 * @function updateDeployment
 * @description Updates an existing deployment.
 * @param {string} id - The ID of the deployment to update.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const updateDeployment = DeploymentAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

/**
 * @function repositoryOperations
 * @description Triggers actions (start, stop, restart, etc.) on a repository's deployment.
 * @param {string} repositoryAlias - The unique alias of the repository.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const repositoryOperations = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/actions/',
    method: 'POST'
});