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

export const deleteRepository = RepositoryAPI.register({
    path: '/:id/',
    method: 'DELETE'
});

export const getRepositories = RepositoryAPI.register({
    path: '/me/',
    method: 'GET'
});

export const storageExplorer = RepositoryAPI.register({
    path: '/storage/:id/explore/:route/',
    method: 'GET'
});

export const readRepositoryFile = RepositoryAPI.register({
    path: '/storage/:id/read/:route/',
    method: 'GET'
});