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
import * as dockerNetworkSlice from '@services/dockerNetwork/slice';
import * as dockerNetworkService from '@services/dockerNetwork/service'

export const createDockerNetwork = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(dockerNetworkSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: dockerNetworkService.createDockerNetwork,
        loaderState: dockerNetworkSlice.setIsOperationLoading,
        query: { body }
    });
};