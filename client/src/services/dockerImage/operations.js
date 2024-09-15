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

import OperationHandler from '@utilities/operationHandler';
import * as dockerImageSlice from '@services/dockerImage/slice';
import * as dockerImageService from '@services/dockerImage/service'

export const createDockerContainer = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(dockerImageSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerImageService.createDockerContainer,
        loaderState: dockerImageSlice.setIsOperationLoading,
        query: { body }
    });
};