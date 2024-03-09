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

/**
 * @function handleAuthResponse
 * @description Private helper function to streamline authentication flow after successful login or signup.
 * @param {Object} data - Response data containing user details and JWT token.
 * @param {function} dispatch - Redux dispatch function.
*/
const handleAuthResponse = (data, dispatch) => {
    authLocalStorageService.setCurrentUserToken(data.token);
    dispatch(authSlice.setUser(data.user));
    dispatch(authSlice.setIsAuthenticated(true));
};

/**
 * @function getMyProfile
 * @description Fetches the currently authenticated user's profile from the server.
 * @returns {Promise} Resolves when the user profile is received.
*/
export const getMyProfile = () => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => dispatch(authSlice.setUser(data)));
    operation.use({
        api: authService.myProfile,
        loaderState: authSlice.setIsLoading
    });
};

/**
 * @function signUp
 * @description Handles new user registration.
 * @param {Object} body - User registration data.
 * @returns {Promise} Resolves when registration is successful.
*/
export const signUp = (body) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signUp,
        loaderState: authSlice.setIsLoading,
        query: { body }
    });
};

/**
 * @function signIn 
 * @description Handles existing user login.
 * @param {Object} body - User credentials (email/username and password).
 * @returns {Promise} Resolves when login is successful.
*/
export const signIn = (body) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signIn,
        loaderState: authSlice.setIsLoading,
        query: { body }
    });
};

/**
 * @function updateMyProfile
 * @description Updates the current user's profile information.
 * @param {Object} body - Updated profile data.
 * @param {function} navigate - Navigation function (likely from a routing library).
 * @returns {Promise} Resolves when profile update is successful.
*/
export const updateMyProfile = (body, navigate) => async (dispatch) => {
    // TODO: In backend, verify (newPassword === currentPassword -> err)
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

/**
 * @function deleteMyProfile
 * @description Permanently deletes the current user's account and logs them out.
 * @returns {Promise} Resolves when account deletion is successful.
*/
export const deleteMyProfile = () => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', () => dispatch(logout()));
    operation.use({
        api: authService.deleteMyProfile,
        loaderState: authSlice.setIsEliminatingAccount
    });
};

/**
 * @function updateMyPassword
 * @description Updates the current user's password.
 * @param {Object} body - Contains the old and new password.
 * @param {function} navigate - Navigation function, likely from a routing library.
 * @returns {Promise} Resolves when password update is successful.
*/
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

/**
 * @function logout
 * @description Logs the current user out of the application.
 * @returns {Promise} Resolves when the logout process is complete.
*/
export const logout = () => async (dispatch) => {
    await dispatch(authSlice.setIsLoading(true));
    authLocalStorageService.removeCurrentUserToken();
    await dispatch(authSlice.setIsAuthenticated(false));
    await dispatch(authSlice.setIsLoading(false));
};