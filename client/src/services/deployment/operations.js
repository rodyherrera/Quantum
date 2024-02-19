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
import OperationHandler from '@utilities/operationHandler';

export const getRepositoryDeployments = (repositoryAlias) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);
    operation.use({
        api: deploymentService.getRepositoryDeployments,
        loaderState: deploymentSlice.setIsLoading,
        responseState: deploymentSlice.setDeployments,
        query: { query: { params: { repositoryAlias } } }
    });
};

export const deleteRepositoryDeployment = (repositoryAlias, deploymentId) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);
    operation.use({
        api: deploymentService.deleteRepositoryDeployment,
        loaderState: deploymentSlice.setIsOperationLoading,
        responseState: deploymentSlice.setDeployments,
        query: { query: { params: { repositoryAlias, deploymentId } } }
    });
};

export const getActiveDeploymentEnvironment = (repositoryAlias) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);

    operation.on('response', (data) => {
        data.variables = Object.entries(data.variables);
        dispatch(deploymentSlice.setEnvironment(data));
    });

    operation.use({
        api: deploymentService.getActiveDeploymentEnvironment,
        loaderState: deploymentSlice.setIsEnvironmentLoading,
        query: { query: { params: { repositoryAlias } } }
    });
};

export const updateDeployment = (id, body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);
    operation.on('response', () => navigate('/dashboard/'));
    operation.use({
        api: deploymentService.updateDeployment,
        loaderState: deploymentSlice.setIsOperationLoading,
        query: { body, query: { params: { id } } }
    });
};

export const repositoryActions = (repositoryAlias, loaderState, body) => async (dispatch) => {
    loaderState(true);
    const operation = new OperationHandler(deploymentSlice, dispatch);

    operation.on('response', ({ status, repository }) => {
        dispatch(repositorySlice.updateDeploymentStatus({ _id: repository._id, status }));
    });

    operation.on('finally', () => loaderState(false));

    operation.use({
        api: deploymentService.repositoryOperations,
        query: { body, query: { params: { repositoryAlias } } }
    });
};