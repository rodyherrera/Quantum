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
 * @constant GithubAPI
 * @description Represents the base endpoint for GitHub-related API requests.
 * @type {APIRequestBuilder} An instance of the APIRequestBuilder utility.
*/
export const GithubAPI = new APIRequestBuilder('/github');

/**
 * @function createAccount
 * @description Handles the creation of a new GitHub account. This likely involves sending user data 
 * to the GitHub API for account creation purposes.
 * @param {Object} body - Data required to create a GitHub account.
 * @returns {Promise} Resolves or rejects based on the API request outcome.
*/
export const createAccount = GithubAPI.register({
    path: '/',
    method: 'POST'
});