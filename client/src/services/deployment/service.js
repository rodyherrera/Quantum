import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const DeploymentAPI = new StandardizedAPIRequestBuilder('/deployment');

export const getRepositoryDeployments = DeploymentAPI.register({
    path: '/repository/:repositoryName/',
    method: 'GET'
});

export const deleteRepositoryDeployment = DeploymentAPI.register({
    path: '/repository/:repositoryName/:deploymentId',
    method: 'DELETE'
});