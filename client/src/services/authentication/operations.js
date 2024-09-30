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
import createOperation from '@utilities/api/operationHandler';

/**
 * @function handleAuthResponse
 * @description Private helper function to streamline authentication flow after successful login or signup.
 * @param {Object} data - Response data containing user details and JWT token.
 * @param {function} dispatch - Redux dispatch function.
*/
const handleAuthResponse = (data, dispatch) => {
    authLocalStorageService.setCurrentUserToken(data.token);
    dispatch(authSlice.setState({ path: 'user', value: data.user }));
    dispatch(authSlice.setState({ path: 'loadingStatus.isLoading', value: true }));
};

/**
 * @function getMyProfile
 * @description Fetches the currently authenticated user's profile from the server.
 * @returns {Promise} Resolves when the user profile is received.
*/
export const getMyProfile = () => async (dispatch) => {
    const operation = createOperation(authSlice, dispatch);
    operation.on('response', (data) => dispatch(authSlice.setState({ path: 'user', value: data })));
    operation.use({
        api: authService.myProfile,
        loaderState: 'loadingStatus.isLoading'
    });
};

/**
 * @function signUp
 * @description Handles new user registration.
 * @param {Object} body - User registration data.
 * @returns {Promise} Resolves when registration is successful.
*/
export const signUp = (body) => async (dispatch) => {
    const operation = createOperation(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signUp,
        loaderState: 'loadingStatus.isLoading',
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
    const operation = createOperation(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signIn,
        loaderState: 'loadingStatus.isLoading',
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
    const operation = createOperation(authSlice, dispatch);
    operation.on('response', (data) => {
        dispatch(authSlice.setState({ path: 'user', value: data }));
        navigate('/dashboard/');
    });
    operation.use({
        api: authService.updateMyProfile,
        loaderState: 'loadingStatus.isOperationLoading',
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
    const operation = createOperation(authSlice, dispatch);
    operation.on('response', () => dispatch(logout()));
    operation.use({
        api: authService.deleteMyProfile,
        loaderState: 'authStatus.isEliminatingAccount'
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
    const operation = createOperation(authSlice, dispatch);
    operation.on('response', (data) => {
        handleAuthResponse(data, dispatch);
        navigate('/auth/account/');
    });
    operation.use({
        api: authService.updateMyPassword,
        loaderState: 'loadingStatus.isOperationLoading',
        query: { body }
    });
};

/**
 * @function logout
 * @description Logs the current user out of the application.
 * @returns {Promise} Resolves when the logout process is complete.
*/
export const logout = () => async (dispatch) => {
    await dispatch(authSlice.setLoadingStatus({ key: 'isLoading', value: false }));
    authLocalStorageService.removeCurrentUserToken();
    await dispatch(authSlice.setAuthStatus({ key: 'isAuthenticated', value: false }));
    await dispatch(authSlice.setLoadingStatus({ key: 'isLoading', value: false }));
};