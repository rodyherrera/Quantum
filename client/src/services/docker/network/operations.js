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
import { getMyDockerImages } from '@services/docker/image/operations';
import { getMyDockerContainers } from '@services/docker/container/operations';
import { getMyPortBindings } from '@services/portBinding/operations';
import * as dockerNetworkSlice from '@services/docker/network/slice';
import * as dockerNetworkService from '@services/docker/network/service'

export const createDockerNetwork = (body, navigate) => async (dispatch) => {
    const operation = createOperation(dockerNetworkSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerNetworkService.createDockerNetwork,
        loaderState: 'isOperationLoading',
        body
    });
};

export const updateDockerNetwork = (id, body, navigate) => async (dispatch) => {
    const operation = createOperation(dockerNetworkSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerNetworkService.updateDockerNetwork,
        loaderState: 'isOperationLoading',
        query: { params: { id } },
        body
    });
};

export const deleteDockerNetwork = (id) => async (dispatch) => {
    const operation = createOperation(dockerNetworkSlice, dispatch);
    operation.on('finally', () => {
        dispatch(getMyDockerNetworks());
        dispatch(getMyDockerContainers());
        dispatch(getMyPortBindings());
        dispatch(getMyDockerImages());
    });
    operation.use({
        api: dockerNetworkService.deleteDockerNetwork,
        loaderState: 'isOperationLoading',
        query: { params: { id } }
    })
};

export const getMyDockerNetworks = () => (dispatch) => {
    const operation = createOperation(dockerNetworkSlice, dispatch);
    operation.use({
        api: dockerNetworkService.getMyDockerNetworks,
        responseState: 'dockerNetworks',
        loaderState: 'isLoading',
        statsState: 'networkStats'
    });
};