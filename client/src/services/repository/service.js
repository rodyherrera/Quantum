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

export const updateRepository = RepositoryAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

export const getRepositories = RepositoryAPI.register({
    path: '/me/',
    method: 'GET'
});