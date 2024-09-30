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
import * as portBindingSlice from '@services/portBinding/slice';
import * as portBindingService from '@services/portBinding/service'

export const createPortBinding = (body, navigate) => async (dispatch) => {
    const operation = createOperation(portBindingSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });
    operation.use({
        api: portBindingService.createPortBinding,
        loaderState: 'isOperationLoading',
        query: { body }
    });
};

export const getMyPortBindings = () => async (dispatch) => {
    const operation = createOperation(portBindingSlice, dispatch);
    operation.use({
        api: portBindingService.getMyPortBindings,
        responseState: 'portBindings',
        loaderState: portBindingSlice.setIsLoading
    });
};