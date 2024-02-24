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
import ServerRequestBuilder from '@utilities/serverRequestBuilder';
import { getCurrentUserToken } from '@services/authentication/localStorageService';

/**
 * This class simplifies API requests while providing features like
 * automatic authorization header inclusion and flexible request configuration.
*/
class APIRequestBuilder{
    /**
     * Constructor for the APIRequestBuilder class.
     * 
     * @param {string} baseEndpoint - The base endpoint for all API requests made through this instance.
    */
    constructor(baseEndpoint){
        this.baseEndpoint = baseEndpoint;
        // Sets authorization header on creation
        this.setAuthorizationHeader();
    };

    /**
     * Sets the 'Authorization' header for API requests if an authentication token is present.
    */
    setAuthorizationHeader(){
        const authenticationToken = getCurrentUserToken();
        if(!authenticationToken) return;
        axios.defaults.headers.common['Authorization'] = `Bearer ${authenticationToken}`;
    };

    /**
     * Builds a complete URL for an API request.
     * 
     * @param {string} path - The path of the API resource, relative to the base endpoint.
     * @param {object} params - An object containing values for path parameters (e.g., :userId).
     * @param {object} queryParams - An object containing query parameters (e.g., ?fields=name).
     * @returns {string} - The constructed URL.
    */
    buildUrl(path, params = {}, queryParams = {}){
        const url = new URL(`${import.meta.env.VITE_SERVER}${import.meta.env.VITE_API_SUFFIX}${this.baseEndpoint}${path}`);
        // Path parameters (more robust than string manipulation)
        url.pathname.split('/').forEach((part) => {
            if(part.startsWith(':')){
                const key = part.slice(1);
                if(params[key]){
                    url.pathname = url.pathname.replace(part, encodeURIComponent(params[key]));
                    delete params[key];
                }
            }
        });
        // Query parameters
        Object.entries(queryParams).forEach(([ key, value ]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    };

    /**
     * Creates a flexible request builder function, allowing customization of HTTP methods and parameters.
     * 
     * @param {object} config - Configuration for the request.
     * @param {string} config.path - The path of the API resource.
     * @param {string} [config.method='GET'] - The HTTP method (GET, POST, PUT, etc.).
     * @returns {function} -  A function to further customize and execute the request.
    */ 
    register({ path, method = 'GET' }){
        return ({ query = {}, body = {}}) => {
            const url = this.buildUrl(path, query?.params, query?.queryParams);
            const args = [url, body];
            return new ServerRequestBuilder()
                .register({ callback: axios[method.toLowerCase()], args });
        };
    };
};

export default APIRequestBuilder;