import axios from 'axios';
import ServerRequestBuilder from '@utilities/serverRequestBuilder';
import { getCurrentUserToken } from '@services/authentication/localStorageService';

class APIRequestBuilder{
    constructor(baseEndpoint){
        this.baseEndpoint = baseEndpoint;
        // Eagerly set the header
        this.setAuthorizationHeader();
    };

    setAuthorizationHeader(){
        const authenticationToken = getCurrentUserToken();
        if(!authenticationToken) return;
        axios.defaults.headers.common['Authorization'] = `Bearer ${authenticationToken}`;
    };

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

    register({ path, method = 'GET' }){
        return ({ query = {}, body = {}}) => {
            const url = this.buildUrl(path, query?.params, query?.queryParams);
            const args = [url, body];
            console.log(url);
            return new ServerRequestBuilder()
                .register({ callback: axios[method.toLowerCase()], args });
        };
    };
};

export default APIRequestBuilder;