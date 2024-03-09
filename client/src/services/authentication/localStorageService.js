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

const localStorageId = 'Quantum::Authentication::Token';

/**
 * @function setCurrentUserToken
 * @description Stores the provided JWT (JSON Web Token) in browser local storage for authentication purposes.
 * @param {string} token - The JWT to be stored.
*/
export const setCurrentUserToken = (token) => {
    localStorage.setItem(localStorageId, token);
};

/**
 * @function getCurrentUserToken
 * @description Retrieves the currently stored JWT from browser local storage, if it exists.
 * @returns {string|null} The JWT if found, or null otherwise.
*/
export const getCurrentUserToken = () => {
    return localStorage.getItem(localStorageId);
};

/**
 * @function removeCurrentUserToken
 * @description Removes the stored JWT from browser local storage, effectively logging the user out.
*/
export const removeCurrentUserToken = () => {
    localStorage.removeItem(localStorageId);
};