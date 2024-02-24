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

/**
 * A utility class for executing and managing server requests, focusing on
 * consistent error handling and a simplified interface.
*/
class ServerRequestBuilder{
    /**
     * Extracts and processes potential errors from server responses.
     * 
     * @param {Error} error - The error object caught during the request.
     * @returns {ServerRequestError} - A structured error for easier handling.
    */
    handleRejection(error){
        const message = error.response?.data?.message || error.message;
        return message;
    };

    /**
     * Executes a provided callback function (presumably making a network request) 
     * while handling potential errors and providing a consistent response format.
     * 
     * @param {object} config - Request configuration
     * @param {function} config.callback - The function to execute, expected to perform an API call.
     * @param {array} [config.args=[]] - Arguments to be passed to the callback function.
     * @returns {Promise<any>} - Resolves with the response data or rejects with a `ServerRequestError`.
    */
    async register({ callback, args = [] }){
        try{
            const response = await callback(...args);
            // Asumming Quantum Backend API consitency
            return response.data || response;
        }catch(error){
            throw this.handleRejection(error);
        }
    };
};

export default ServerRequestBuilder;