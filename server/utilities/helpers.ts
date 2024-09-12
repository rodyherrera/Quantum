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

import axios from 'axios';
import logger from '@utilities/logger';
import fs from 'fs';
import _ from 'lodash';

/**
 * Retrieves the user's public IP address using the ipify.org service.
 * 
 * @returns {Promise<string>} A Promise resolving to the public IP address as a string.
 *                            In case of error, returns '127.0.0.1'.
 */
export const getPublicIPAddress = async (): Promise<string> => {
    try{
        const { data } = await axios.get('https://api.ipify.org/');
        return data;
    }catch(error){
        logger.error('Error fetching IP address:',error);  
        return '127.0.0.1';
    }
};

/**
 * Ensures that the log directory exists. Creates it if not.
 * @param {string} directoryPath - The path to the log directory.
 */
export const ensureDirectoryExists = async (directoryPath: string): Promise<void> => {
    try{
        await fs.promises.access(directoryPath);
    }catch(error: any){
        // Only handle directory not found error
        if(error.code === 'ENOENT'){
            await fs.promises.mkdir(directoryPath, { recursive:true });
        }else{
            logger.error('@utilitieS/ensureDirectoryExists', error);
            throw error;
        }
    }
};

/**
 * Initiates a graceful shutdown of the Quantum Cloud server by stopping all active user containers.
 */
export const cleanHostEnvironment = async (): Promise<void> => {
    logger.info('Cleaning up the host environment, shutting down user containers...');
    const { userContainers } = global as any;
    const totalContainers = Object.keys(userContainers).length;
    logger.info(`${totalContainers} active docker instances were detected in the runtime.`);
    for(const userId in userContainers){
        const container = userContainers[userId];
        await container.instance.stop();
    }
    logger.info('Containers shut down successfully, safely shutting down the server...');
};

/**
 * Creates a new object containing only the specified fields from the original object.
 *
 * @param {Object} object - The original object to filter.
 * @param  {...string} fields -  The names of the fields to include in the filtered object.
 * @returns {Object} - A new object containing only the specified fields.
 */
export const filterObject = (object: object, ...fields: string[]): object => {
    return _.pick(object, fields);
};

/**
 * Determines whether an ID is a MongoDB ObjectID or a slug.
 *
 * @param {string} id - The ID to evaluate.
 * @returns {Object} -  An object with a property of either '_id' (for ObjectIDs) or 'slug' (for slugs).
 */
export const checkIfSlugOrId = (id: string): { _id?: string, slug?: string } => {
    return /^[a-fA-F0-9]{24}$/.test(id)? { _id: id } : { slug: id };
};

/**
 * A higher-order function that wraps an asynchronous Express middleware function
 * to handle errors and pass them to the next middleware in the stack.
 *
 * @param {Function} asyncFunction - An asynchronous middleware function that handles Express requests.
 * @returns {Function} A middleware function that catches any errors thrown by the `asyncFunction`
 * and passes them to the Express error handling middleware.
 */
export const catchAsync = (
    asyncFunction: (req: any, res: any, next: any) => Promise<void>
): (req: any, res: any, next: any) => void => {
    /**
     * Wraps the provided async middleware function to handle errors.
     *
     * @param {any} req - The Express request object.
     * @param {any} res - The Express response object.
     * @param {any} next - The Express next middleware function.
     */
    return async (req, res, next) => {
        try{
            await asyncFunction(req, res, next);
        }catch(error){
            next(error);
        }
    };
};

