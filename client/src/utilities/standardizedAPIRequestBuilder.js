import ServerRequestBuilder from '@utilities/serverRequestBuilder';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import axios from 'axios';

export default class StandardizedAPIRequestBuilder{
    constructor(endpoint){
        this.endpoint = endpoint;
        this.setError = function(){};
    };

    bindErrorSetter = (setter) => {
        this.setError = setter;
    };

    parsePath(path, params){
        const parts = path.split('/');
        return parts.map((part) => {
            if(part[0] === ':'){
                const key = part.slice(1);
                const value = params[key];
                delete params[key];
                return value;
            };
            return part;
        }).join('/');
    };

    appendParameter(key, value, queryParams){
        return queryParams += `${queryParams.length ? '&' : '?'}${key}=${value}`;
    };

    handleQuery(query, queryParams){
        const { appendParameter } = this;

        (query?.fields) && (appendParameter('fields', query.fields.join(','), queryParams));
        (query?.sort) && (appendParameter('sort', query.sort.join(','), queryParams));
        (query?.paginate?.limit) && (appendParameter('limit', query.paginate.limit, queryParams));
        (query?.paginate?.page) && (appendParameter('page', query.paginate.page, queryParams));
        (query?.populate) && (appendParameter('populate', (typeof query.populate === 'object') ? (JSON.stringify(query.populate)) : (query.populate), queryParams));

        if(query?.filter){
            const keys = Object.keys(query.filter);
            keys.forEach((key) => appendParameter(key, query.filter[key], queryParams));
        }

        return queryParams;
    };

    createEndpoint = (parsedPath, queryParams) => {
        return `${import.meta.env.VITE_SERVER + import.meta.env.VITE_API_SUFFIX + this.endpoint}${parsedPath}`.concat(queryParams);
    };

    setAuthorizationHeader = () => {
        const authToken = getCurrentUserToken();
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        }
    };

    register({ path, method = 'GET' }){
        const buffer = { args: [], method: method.toLowerCase() };
        return ({ body, query = {} }) => {
            this.setAuthorizationHeader();
            let queryParams = '';
            let parsedPath = path;
            if(query?.params){
                parsedPath = this.parsePath(path, query.params);
            }
            this.handleQuery(query, queryParams);
            if(buffer.method === 'get' && body){
                const keys = Object.keys(body);
                keys.forEach((key) => appendParameter(key, body[key]));
            }
            const endpoint = this.createEndpoint(parsedPath, queryParams);
            buffer.args = [endpoint];
            if(['post', 'put', 'patch'].includes(buffer.method)){
                buffer.args.push(body);
            }
            return new ServerRequestBuilder({ setError: this.setError })
                .register({ callback: axios[buffer.method], args: buffer.args });
        };
    };
};