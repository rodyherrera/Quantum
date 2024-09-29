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
 * @constant AuthenticationAPI
 * @description Represents the base endpoint for authentication-related API requests.
 * @type {APIRequestBuilder} An instance of the APIRequestBuilder utility.
*/
export const AuthenticationAPI = new APIRequestBuilder('/auth');

/**
 * @function signUp
 * @description Handles user registration requests.
 * @param {Object} body - The user registration data.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const signUp = AuthenticationAPI.register({
    path: '/sign-up/',
    method: 'POST'
});

/**
 * @function myProfile
 * @description Fetches the profile information of the currently authenticated user. 
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const myProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'GET'
});

/**
 * @function updateMyPassword
 * @description Sends a request to update the password of the authenticated user.
 * @param {Object} body - Contains the current and new passwords.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const updateMyPassword = AuthenticationAPI.register({
    path: '/me/update/password/',
    method: 'PATCH'
});

/**
 * @function updateMyProfile
 * @description Sends a request to update the profile information of the authenticated user.
 * @param {Object} body - Contains the updated profile data.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const updateMyProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'PATCH'
});

/**
 * @function deleteMyProfile 
 * @description Sends a request to delete the profile of the authenticated user.
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const deleteMyProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'DELETE'
});

/**
 * @function signIn
 * @description Handles user sign-in requests.
 * @param {Object} body - Contains user credentials (likely email or username and password).
 * @returns {Promise} Resolves or rejects based on the API request outcome. 
*/
export const signIn = AuthenticationAPI.register({
    path: '/sign-in/',
    method: 'POST'
});