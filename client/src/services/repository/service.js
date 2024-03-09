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
 * @constant RepositoryAPI
 * @description Represents the base endpoint for repository-related API requests.
 * @type {APIRequestBuilder} An instance of the APIRequestBuilder utility.
*/
export const RepositoryAPI = new APIRequestBuilder('/repository');

/**
 * @function getMyGithubRepositories
 * @description Fetches a list of the user's repositories from GitHub.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const getMyGithubRepositories = RepositoryAPI.register({
    path: '/me/github/',
    method: 'GET'
});

/**
 * @function createRepository
 * @description Creates a new Quantum Cloud repository for the user.
 * @param {Object} body - Data required to create the new repository.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const createRepository = RepositoryAPI.register({
    path: '/',
    method: 'POST'
});

/**
 * @function updateRepository
 * @description Updates the details of an existing repository.
 * @param {string} id - The ID of the repository to update. 
 * @param {Object} body - Updated repository data. 
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const updateRepository = RepositoryAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

/**
 * @function deleteRepository
 * @description Deletes an existing repository.
 * @param {string} id - The ID of the repository to delete.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const deleteRepository = RepositoryAPI.register({
    path: '/:id/',
    method: 'DELETE'
});

/**
 * @function getRepositories
 * @description Fetches a list of repositories for the current user.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const getRepositories = RepositoryAPI.register({
    path: '/me/',
    method: 'GET'
});

/**
 * @function storageExplorer
 * @description Retrieves a directory listing from a repository's storage.
 * @param {string} id - The ID of the repository.
 * @param {string} route - The directory path within the repository.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const storageExplorer = RepositoryAPI.register({
    path: '/storage/:id/explore/:route/',
    method: 'GET'
});

/**
 * @function readRepositoryFile
 * @description Reads the contents of a file from a repository's storage.
 * @param {string} id - The ID of the repository.
 * @param {string} route - The file path within the repository.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const readRepositoryFile = RepositoryAPI.register({
    path: '/storage/:id/read/:route/',
    method: 'GET'
});

/**
 * @function updateRepositoryFile
 * @description Updates the contents of a file in a repository's storage.
 * @param {string} id - The ID of the repository.
 * @param {string} route - The file path within the repository.
 * @param {string} content - The updated file content.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const updateRepositoryFile = RepositoryAPI.register({
    path: '/storage/:id/overwrite/:route/',
    method: 'POST'
});