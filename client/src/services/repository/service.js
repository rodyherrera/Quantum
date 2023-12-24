import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const RepositoryAPI = new StandardizedAPIRequestBuilder('/repository');

export const getMyGithubRepositories = RepositoryAPI.register({
    path: '/me/github/',
    method: 'GET'
});

export const createRepository = RepositoryAPI.register({
    path: '/',
    method: 'POST'
});