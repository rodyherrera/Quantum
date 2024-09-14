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
import * as dockerContainerSlice from '@services/dockerContainer/slice';
import * as dockerContainerService from '@services/dockerContainer/service'

export const getMyDockerContainers = () => async (dispatch) => {
    const operation = new OperationHandler(dockerContainerSlice, dispatch);
    operation.use({
        api: dockerContainerService.getMyDockerContainers,
        responseState: dockerContainerSlice.setDockerContainers,
        loaderState: dockerContainerSlice.setIsLoading
    });
};