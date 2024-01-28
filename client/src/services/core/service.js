import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const ServerAPI = new StandardizedAPIRequestBuilder('/server');

export const getServerHealth = ServerAPI.register({
    path: '/health',
    method: 'GET'
});