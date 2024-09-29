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

import OperationHandler from '@utilities/api/operationHandler';
import * as dockerContainerSlice from '@services/docker/container/slice';
import * as dockerContainerService from '@services/docker/container/service'

export const getMyDockerContainers = () => async (dispatch) => {
    const operation = new OperationHandler(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.getMyDockerContainers,
        responseState: dockerContainerSlice.setDockerContainers,
        loaderState: dockerContainerSlice.setIsLoading
    });
};

export const updateDockerContainer = (id, body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(dockerContainerSlice, dispatch);
    operation.on('response', (data) => {
        console.log(data);
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerContainerService.updateDockerContainer,
        loaderState: dockerContainerSlice.setIsOperationLoading,
        query: { body, query: { params: { id } } }
    });
};

export const getRandomAvailablePort = () => async (dispatch) => {
    const operation = new OperationHandler(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.getRandomAvailablePort,
        responseState: dockerContainerSlice.setRandomAvailablePort,
        loaderState: dockerContainerSlice.setIsRandomAvailablePortLoading
    });
};

export const createDockerContainer = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(dockerContainerSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerContainerService.createDockerContainer,
        loaderState: dockerContainerSlice.setIsOperationLoading,
        query: { body }
    });
};