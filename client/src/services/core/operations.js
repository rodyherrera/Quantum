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

import * as authSlice from '@services/authentication/slice';
import * as deploymentSlice from '@services/deployment/slice';
import * as githubSlice from '@services/github/slice';
import * as repositorySlice from '@services/repository/slice';
import * as coreService from '@services/core/service';
import * as coreSlice from '@services/core/slice';
import * as containerSlice from '@services/docker/container/slice';
import * as networkSlice from '@services/docker/network/slice';
import * as imageSlice from '@services/docker/image/slice';
import * as portBindingSlice from '@services/portBinding/slice';
import errorCodeHandler from '@services/core/errorCodeHandler';
import createOperation from '@utilities/api/operationHandler';

const slices = [
    authSlice, 
    deploymentSlice, 
    githubSlice, 
    repositorySlice, 
    coreSlice, 
    containerSlice, 
    networkSlice, 
    imageSlice, 
    portBindingSlice
];

/**
 * @function globalErrorHandler
 * @description Centralized error handler for Quantum Cloud. Dispatches actions to both the global error store and a slice-specific error store.
 * @param {string} message - The error message to display.
 * @param {Object} [slice=null] - An optional Redux slice object to update with a more readable error.
 * @returns {function} - Redux dispatch function.
*/
export const globalErrorHandler = (message, slice = null) => (dispatch) => {
    if(slice === null) return;
    // Translates error codes if necessary
    const readableError = errorCodeHandler(message);
    // Updates the slice-specific error state
    dispatch(slice.setState({ path: 'error', value: readableError }));
};

/**
 * @function resetErrorForAllSlices
 * @description Resets the error state for all relevant Redux slices.
 * @returns {function} - Redux dispatch function.
*/
export const resetErrorForAllSlices = () => (dispatch) => {
    for(const slice of slices){
        dispatch(slice.setState({ path: 'error', value: null }));
    }
};

/**
 * @function getServerHealth
 * @description Fetches the health status of the Quantum Cloud server.
 * @returns {Promise} Resolves when the server health check is complete.
*/
export const getServerHealth = () => async (dispatch) => {
    const operation = createOperation(coreSlice, dispatch);
    operation.use({
        api: coreService.getServerHealth,
        responseState: 'serverHealth',
        loaderState: 'isServerHealthLoading'
    });
};