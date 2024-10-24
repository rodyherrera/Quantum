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

import createOperation from '@utilities/api/operationHandler';
import * as dockerContainerSlice from '@services/docker/container/slice';
import * as dockerContainerService from '@services/docker/container/service'

export const getMyDockerContainers = () => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.getMyDockerContainers,
        responseState: 'dockerContainers',
        loaderState: 'isLoading',
        statsState: 'stats'
    });
};

export const deleteDockerContainer = (id, containers) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.on('finally', () => {
        const updatedContainers = containers.filter((container) => container._id !== id);
        dispatch(dockerContainerSlice.setState({
            path: 'dockerContainers',
            value: updatedContainers
        }));
    });
    operation.use({
        api: dockerContainerService.deleteDockerContainer,
        loaderState: 'isOperationLoading',
        query: { params: { id } }
    });
};

// duplicated code @services/repository/operations.js
export const storageExplorer = (id, route) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.storageExplorer,
        loaderState: 'isOperationLoading',
        responseState: 'containerFiles',
        query: { params: { id, route } }
    });
};

export const readContainerFile = (id, route) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.readContainerFile,
        loaderState: 'isOperationLoading',
        responseState: 'selectedContainerFile',
        query: { params: { id, route } }
    });
};

export const updateContainerFile = (id, route, content) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.updateContainerFile,
        loaderState: 'isOperationLoading',
        query: { params: { id, route } },
        body: { content }
    });
};

export const updateDockerContainer = (id, body, navigate) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerContainerService.updateDockerContainer,
        loaderState: 'isOperationLoading',
        query: { params: { id } },
        body
    });
};

export const getRandomAvailablePort = () => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.getRandomAvailablePort,
        responseState: 'randomAvailablePort',
        loaderState: 'isRandomAvailablePortLoading'
    });
};

export const createDockerContainer = (body, navigate) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerContainerService.createDockerContainer,
        loaderState: 'isOperationLoading',
        body
    });
};