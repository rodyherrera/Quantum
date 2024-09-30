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

import * as githubService from '@services/github/service';
import * as githubSlice from '@services/github/slice';
import * as authSlice from '@services/authentication/slice';
import createOperation from '@utilities/api/operationHandler';

/**
 * @function authenticate
 * @description Initiates the GitHub authentication flow for a user.
 * @param {string} userId - The ID of the user to authenticate.
 * 
 * Redirects the user to a server-side endpoint responsible for handling OAuth authorization with GitHub.
*/
export const authenticate = async (userId) => {
    const Endpoint = `${import.meta.env.VITE_SERVER + import.meta.env.VITE_API_SUFFIX}/github/authenticate?userId=${userId}`;
    window.location.href = Endpoint;
};

/**
 * @function createAccount
 * @description Creates a new GitHub account and associates it with the user's Quantum Cloud account.
 * @param {Object} body - Data required to create the GitHub account.
 * @returns {Promise} Resolves when the GitHub account creation process is complete.
*/
export const createAccount = (body) => async (dispatch) => {
    const operation = createOperation(githubSlice, dispatch);
    operation.use({
        api: githubService.createAccount,
        loaderState: githubSlice.setIsLoading,
        responseState: authSlice.setGithubAccount,
        query: { body }
    });
};