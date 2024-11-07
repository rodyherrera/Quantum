import axios from 'axios';
import ServerRequestBuilder from '@utilities/api/serverRequestBuilder';

class APIRequestBuilder{
    /**
     * Constructor for the APIRequestBuilder class.
     *
     * @param {string} baseEndpoint - The base endpoint for all API requests made through this instance.
    */
    constructor(baseEndpoint){
        this.baseEndpoint = baseEndpoint;
        this.authToken = null;
    }

    /**
     * Builds a complete URL for an API request with support for path and query parameters.
     *
     * @param {string} path - The path of the API resource, relative to the base endpoint.
     * @param {object} params - An object containing values for path parameters (e.g., :userId).
     * @param {object} queryParams - An object containing query parameters (e.g., ?fields=name).
     * @returns {string} - The constructed URL.
    */  
    buildUrl(path, params = {}, queryParams = {}){
        // Replace path parameters with their actual values
        const compiledPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
            const param = params[key];
            if(param){
                return encodeURIComponent(param);
            }
            throw new Error(`Missing path parameter: ${key}`);
        });
        
        // Construct the base URL
        const baseUrl = `${import.meta.env.VITE_SERVER}${import.meta.env.VITE_API_SUFFIX}${this.baseEndpoint}${compiledPath}`;
        const url = new URL(baseUrl);
        
        // Append query parameters to the URL
        Object.keys(queryParams).forEach((key) => {
            if(queryParams[key] !== undefined){
                url.searchParams.append(key, queryParams[key]);
            }
        });
        
        return url.toString();
    }

    /**
     * Creates a flexible request builder function, allowing customization of HTTP methods and parameters.
     *
     * @param {object} config - Configuration for the request.
     * @param {string} config.path - The path of the API resource.
     * @param {string} [config.method='GET'] - The HTTP method (GET, POST, PUT, etc.).
     * @returns {function} - A function to further customize and execute the request.
    */
    register({ path, method = 'GET' }){
        return async ({ query = {}, body = {} }) => {
            const url = this.buildUrl(path, query.params, query.queryParams);
            return new ServerRequestBuilder().register({
                callback: axios,
                args: [{
                    method: method.toLowerCase(),
                    url,
                    data: body,
                    withCredentials: true
                }]
            })
        };
    }
}

export default APIRequestBuilder;