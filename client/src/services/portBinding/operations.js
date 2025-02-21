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
import { getMyProfile } from '@services/authentication/operations';

export const createPortBinding = (body, navigate) => async (dispatch) => {
    const operation = createOperation(portBindingSlice, dispatch);
    operation.on('response', () => {
        navigate('/dashboard/');
    });

    operation.on('finally', () => {
        dispatch(getMyProfile());
    });
    
    operation.use({
        api: portBindingService.createPortBinding,
        loaderState: 'isOperationLoading',
        body
    });
};

export const deletePortBinding = (id, portBindings) => async (dispatch) => {
    const operation = createOperation(portBindingSlice, dispatch);
    operation.on('finally', () => {
        const updatedPortBindings = portBindings.filter((portBinding) => portBinding._id !== id);
        dispatch(portBindingSlice.setState({
            path: 'portBindings',
            value: updatedPortBindings
        }));
        dispatch(getMyProfile());
    });
    operation.use({
        api: portBindingService.deletePortBinding,
        loaderState: 'isOperationLoading',
        query: { params: { id } }
    });
};


export const getMyPortBindings = () => async (dispatch) => {
    const operation = createOperation(portBindingSlice, dispatch);
    operation.use({
        api: portBindingService.getMyPortBindings,
        responseState: 'portBindings',
        loaderState: 'isLoading',
        statsState: 'portBindingStats',
        query: {
            queryParams: {
                populate: 'container',
            }
        }
    });
};