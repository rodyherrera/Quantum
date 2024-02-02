import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const DeploymentAPI = new StandardizedAPIRequestBuilder('/deployment');

export const getRepositoryDeployments = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/',
    method: 'GET'
});

export const deleteRepositoryDeployment = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/:deploymentId',
    method: 'DELETE'
});

export const getActiveDeploymentEnvironment = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/environment/',
    method: 'GET'
});

export const updateDeployment = DeploymentAPI.register({
    path: '/:id/',
    method: 'PATCH'
});

export const repositoryActions = DeploymentAPI.register({
    path: '/repository/:repositoryAlias/actions/',
    method: 'POST'
});