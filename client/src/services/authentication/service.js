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

import APIRequestBuilder from '@utilities/apiRequestBuilder';
export const AuthenticationAPI = new APIRequestBuilder('/auth');

export const signUp = AuthenticationAPI.register({
    path: '/sign-up/',
    method: 'POST'
});

export const myProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'GET'
});

export const updateMyPassword = AuthenticationAPI.register({
    path: '/me/update/password/',
    method: 'PATCH'
});

export const updateMyProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'PATCH'
});

export const deleteMyProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'DELETE'
});

export const signIn = AuthenticationAPI.register({
    path: '/sign-in/',
    method: 'POST'
});