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

export const updateDockerContainer = (id, body, navigate) => async (dispatch) => {
    const operation = createOperation(dockerContainerSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerContainerService.updateDockerContainer,
        loaderState: 'isOperationLoading',
        query: { query: { params: { id } } },
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