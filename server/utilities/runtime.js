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

const axios = require('axios');
const _ = require('lodash');

/**
 * Retrieves the user's public IP address using the ipify.org service.
 * 
 * @returns {Promise<string>} A Promise resolving to the public IP address as a string.
 *                            In case of error, returns '127.0.0.1'.
*/
exports.getPublicIPAddress = async () => {
    try{
        const { data } = await axios.get('https://api.ipify.org/');
        return data;
    }catch{
        console.error('Error fetching IP address:', error);  
        return '127.0.0.1';
    }
};

/**
 * Initiates a graceful shutdown of the Quantum Cloud server by stopping all active user containers.
*/
exports.cleanHostEnvironment = async () => {
    console.log('[Quantum Cloud]: Cleaning up the host environment, shutting down user containers...');
    const { userContainers } = global;
    const totalContainers = Object.keys(userContainers).length;
    console.log(`[Quantum Cloud]: ${totalContainers} active docker instances were detected in the runtime.`)
    for(const userId in userContainers){
        const container = userContainers[userId];
        await container.instance.stop();
    }
    console.log('[Quantum Cloud]: Containers shut down successfully, safely shutting down the server...')
};

/**
 * Creates a new object containing only the specified fields from the original object.
 *
 * @param {Object} object - The original object to filter.
 * @param  {...string} fields -  The names of the fields to include in the filtered object.
 * @returns {Object} - A new object containing only the specified fields.
*/
exports.filterObject = (object, ...fields) => {
    return _.pick(object, fields);
};

/**
 * Determines whether an ID is a MongoDB ObjectID or a slug.
 *
 * @param {string} id - The ID to evaluate.
 * @returns {Object} -  An object with a property of either '_id' (for ObjectIDs) or 'slug' (for slugs).
*/
exports.checkIfSlugOrId = (id) => {
    return /^[a-fA-F0-9]{24}$/.test(id) ? { _id: id } : { slug: id };
};

/**
 * Creates a middleware function to handle errors in asynchronous route handlers, optionally executing a cleanup function afterwards.
 *
 * @param {Function} asyncFunction - The asynchronous route handler function.
 * @param {Function} [finalFunction] - An optional cleanup function to execute after error handling.
 * @returns {Function} - A middleware function for Express routes.
*/
exports.catchAsync = (asyncFunction) => {
    return async (req, res, next) => {
        try{
            await asyncFunction(req, res, next);
        }catch (error){
            next(error);
        }
    };
};

module.exports = exports;