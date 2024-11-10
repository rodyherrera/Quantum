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
import { getMyDockerContainers } from '@services/docker/container/operations';
import { getMyDockerNetworks } from '@services/docker/network/operations';
import { getMyPortBindings } from '@services/portBinding/operations';
import * as dockerImageSlice from '@services/docker/image/slice';
import * as dockerImageService from '@services/docker/image/service'

export const createDockerImage = (body, navigate) => async (dispatch) => {
    const operation = createOperation(dockerImageSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerImageService.createDockerImage,
        loaderState: 'isOperationLoading',
        body
    });
};

export const deleteDockerImage = (id) => async (dispatch) => {
    const operation = createOperation(dockerImageSlice, dispatch);
    operation.on('finally', () => {
        dispatch(getMyDockerContainers());
        dispatch(getMyDockerNetworks());
        dispatch(getMyPortBindings());
        dispatch(getMyDockerImages());        
    });
    operation.use({
        api: dockerImageService.deleteDockerImage,
        loaderState: 'isOperationLoading',
        query: { params: { id } }
    })
};

export const getMyDockerImages = () => async (dispatch) => {
    const operation = createOperation(dockerImageSlice, dispatch);
    operation.use({
        api: dockerImageService.getMyDockerImages,
        responseState: 'dockerImages',
        loaderState: 'isLoading',
        statsState: 'stats'
    });
};