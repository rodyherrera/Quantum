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
import * as authLocalStorageService from '@services/authentication/localStorageService';
import * as coreOperations from '@services/core/operations';

export const authenticateWithCachedToken = async (dispatch) => {
    try{
        await dispatch(authSlice.setIsCachedAuthLoading(true));
        const cachedSessionToken = authLocalStorageService.getCurrentUserToken();
        if(!cachedSessionToken) 
            return;
        const authenticatedUser = await authService.myProfile({});
        await dispatch(authSlice.setUser(authenticatedUser.data));
        await dispatch(authSlice.setIsAuthenticated(true));
    }catch(error){
        dispatch(coreOperations.globalErrorHandler(error, authSlice));
    }finally{
        await dispatch(authSlice.setIsCachedAuthLoading(false));
    }
};