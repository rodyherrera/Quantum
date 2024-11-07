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

import * as authService from '@services/authentication/service';
import * as authSlice from '@services/authentication/slice';
import * as coreOperations from '@services/core/operations';

/**
 * @function authenticateWithCachedToken
 * @description Attempts to authenticate a user using a previously stored token from  local storage.
 * @param {function} dispatch - The Redux dispatch function.
 * @returns {Promise} Resolves when the authentication attempt is complete.
*/
export const authenticateWithCachedToken = async (dispatch) => {
    try{
        await dispatch(authSlice.setState({ path: 'authStatus.isCachedAuthLoading', value: true }));
        const authenticatedUser = await authService.myProfile({});
        dispatch(authSlice.setState({ path: 'user', value: authenticatedUser.data }));
        dispatch(authSlice.setState({ path: 'authStatus.isAuthenticated', value: true }));
    }catch(error){
        dispatch(coreOperations.globalErrorHandler(error, authSlice));
    }finally{
        dispatch(authSlice.setState({ path: 'authStatus.isCachedAuthLoading', value: false }));
    }
};