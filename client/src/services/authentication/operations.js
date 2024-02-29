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
import OperationHandler from '@utilities/operationHandler';

const handleAuthResponse = (data, dispatch) => {
    authLocalStorageService.setCurrentUserToken(data.token);
    dispatch(authSlice.setUser(data.user));
    dispatch(authSlice.setIsAuthenticated(true));
};

export const getMyProfile = () => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => dispatch(authSlice.setUser(data)));
    operation.use({
        api: authService.myProfile,
        loaderState: authSlice.setIsLoading
    });
};

export const signUp = (body) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signUp,
        loaderState: authSlice.setIsLoading,
        query: { body }
    });
};

export const signIn = (body) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signIn,
        loaderState: authSlice.setIsLoading,
        query: { body }
    });
};

export const updateMyProfile = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => {
        dispatch(authSlice.setUser(data));
        navigate('/dashboard/');
    });
    operation.use({
        api: authService.updateMyProfile,
        loaderState: authSlice.setIsOperationLoading,
        query: {
            body,
            query: { populate: 'github' }
        }
    });
};

export const deleteMyProfile = () => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', () => dispatch(logout()));
    operation.use({
        api: authService.deleteMyProfile,
        loaderState: authSlice.setIsEliminatingAccount
    });
};

export const updateMyPassword = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => {
        handleAuthResponse(data, dispatch);
        navigate('/auth/account/');
    });
    operation.use({
        api: authService.updateMyPassword,
        loaderState: authSlice.setIsOperationLoading,
        query: { body }
    });
};

export const logout = () => async (dispatch) => {
    await dispatch(authSlice.setIsLoading(true));
    authLocalStorageService.removeCurrentUserToken();
    await dispatch(authSlice.setIsAuthenticated(false));
    await dispatch(authSlice.setIsLoading(false));
};