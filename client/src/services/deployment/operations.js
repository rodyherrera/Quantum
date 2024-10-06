/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import * as deploymentService from '@services/deployment/service';
import * as deploymentSlice from '@services/deployment/slice';
import * as repositorySlice from '@services/repository/slice';
import createOperation from '@utilities/api/operationHandler';

/** 
 * @function getRepositoryDeployments
 * @description Fetches a list of deployments associated with a repository.
 * @param {string} repositoryName - The name of the repository.
 * @returns {Promise} Resolves when the deployments are fetched.
*/
export const getRepositoryDeployments = (repositoryName) => async (dispatch) => {
    const operation = createOperation(deploymentSlice, dispatch);
    operation.use({
        api: deploymentService.getRepositoryDeployments,
        loaderState: 'isLoading',
        responseState: 'deployments',
        query: { query: { params: { repositoryName } } }
    });
};

/**
 * @function deleteRepositoryDeployment
 * @description Deletes a deployment for a specified repository.
 * @param {string} repositoryName - The name of the repository.
 * @param {string} deploymentId - The ID of the deployment to delete.
 * @returns {Promise} Resolves when the deployment is deleted.
*/
export const deleteRepositoryDeployment = (repositoryName, deploymentId) => async (dispatch) => {
    const operation = createOperation(deploymentSlice, dispatch);
    operation.use({
        api: deploymentService.deleteRepositoryDeployment,
        loaderState: 'isOperationLoading',
        responseState: 'deployments',
        query: { query: { params: { repositoryName, deploymentId } } }
    });
};

/**
 * @function getActiveDeploymentEnvironment
 * @description Retrieves the active deployment environment and variables for a repository.
 * @param {string} repositoryAlias - The repository's unique alias.
 * @returns {Promise} Resolves when the environment data is retrieved.
*/
export const getActiveDeploymentEnvironment = (repositoryAlias) => async (dispatch) => {
    const operation = createOperation(deploymentSlice, dispatch);

    operation.on('response', (data) => {
        data.variables = Object.entries(data.variables);
        dispatch(deploymentSlice.setState({
            path: 'environment',
            value: data
        }));
    });

    operation.use({
        api: deploymentService.getActiveDeploymentEnvironment,
        loaderState: 'isEnvironmentLoading',
        query: { query: { params: { repositoryAlias } } }
    });
};

/**
 * @function updateDeployment
 * @description Updates an existing deployment.
 * @param {string} id - The ID of the deployment to update.
 * @param {Object} body - Updated deployment configuration.
 * @param {function} navigate - A navigation function (likely from a routing library).
 * @returns {Promise} Resolves when the deployment is updated.
*/
export const updateDeployment = (id, body, navigate) => async (dispatch) => {
    const operation = createOperation(deploymentSlice, dispatch);
    operation.on('response', () => navigate('/dashboard/'));
    operation.use({
        api: deploymentService.updateDeployment,
        loaderState: 'isOperationLoading',
        query: { query: { params: { id } } },
        body
    });
};

/**
 * @function repositoryActions
 * @description Triggers actions (start, stop, restart, etc.) on a repository's deployment.
 * @param {string} repositoryAlias - The repository's unique alias. 
 * @param {function} loaderState - A function to update UI loading indicators.
 * @param {Object} body - Action data (e.g., the action type to perform).
 * @returns {Promise} Resolves when the deployment operation is complete.
*/
export const repositoryActions = (repositoryAlias, loaderState, body) => async (dispatch) => {
    loaderState(true);
    const operation = createOperation(deploymentSlice, dispatch);

    operation.on('response', ({ status, repository }) => {
        dispatch(repositorySlice.updateRepositories({ repository, status }));
    });

    operation.on('finally', () => loaderState(false));

    operation.use({
        api: deploymentService.repositoryOperations,
        query: { query: { params: { repositoryAlias } } },
        body
    });
};