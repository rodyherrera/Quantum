import ServerRequestBuilder from '@utilities/serverRequestBuilder';
import { getCurrentUserToken } from '@services/authentication/service';
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

    handleQuery(query, queryParams){
        const appendParameter = (key, value) => {
            queryParams += `${queryParams.length ? '&' : '?'}${key}=${value}`;
        };

        (query?.fields) && (appendParameter('fields', query.fields.join(',')));
        (query?.sort) && (appendParameter('sort', query.sort.join(',')));
        (query?.paginate?.limit) && (appendParameter('limit', query.paginate.limit));
        (query?.paginate?.page) && (appendParameter('page', query.paginate.page));
        (query?.populate) && (appendParameter('Populate', (typeof query.populate === 'object') ? (JSON.stringify(query.populate)) : (query.populate)));

        if(query?.filter){
            const keys = Object.keys(query.filter);
            keys.forEach((key) => appendParameter(key, query.filter[key]));
        }

        return queryParams;
    };

    register({ path, method = 'GET' }){
        const buffer = { args: [], method: method.toLowerCase() };
        return ({
            body,
            query = {
                params: undefined,
                fields: undefined,
                sort: undefined,
                search: undefined,
                paginate: undefined,
                populate: undefined,
                filter: undefined
            }
        }) => {
            const authenticationToken = getCurrentUserToken();
            if(authenticationToken){
                axios.defaults.headers.common['Authorization'] = `Bearer ${authenticationToken}`;
            }
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
            const endpoint = `${import.meta.env.VITE_SERVER + import.meta.env.VITE_API_SUFFIX + this.endpoint}${parsedPath}`.concat(queryParams);
            buffer.args = [endpoint];
            if(['post', 'put', 'patch'].includes(buffer.method)){
                buffer.args.push(body);
            }
            return new ServerRequestBuilder({ setError: this.setError })
                .register({ callback: axios[buffer.method], args: buffer.args });
        };
    };
};