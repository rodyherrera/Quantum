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
import * as dockerImageSlice from '@services/docker/image/slice';
import * as dockerImageService from '@services/docker/image/service'

export const createDockerImage = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(dockerImageSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerImageService.createDockerImage,
        loaderState: dockerImageSlice.setIsOperationLoading,
        query: { body }
    });
};

export const getMyDockerImages = () => async (dispatch) => {
    const operation = new OperationHandler(dockerImageSlice, dispatch);
    operation.use({
        api: dockerImageService.getMyDockerImages,
        responseState: dockerImageSlice.setDockerImages,
        loaderState: dockerImageSlice.setIsLoading
    });
};