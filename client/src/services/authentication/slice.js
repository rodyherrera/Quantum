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

import { createSlice } from '@reduxjs/toolkit';

const state = {
    user: {},
    isAuthenticated: false,
    isCachedAuthLoading: true,
    isLoading: false,
    isOperationLoading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState: state,
    reducers: {
        setIsOperationLoading: (state, action) => {
            state.isOperationLoading = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setIsCachedAuthLoading(state, action) {
            state.isCachedAuthLoading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setGithubAccount: (state, action) => {
            state.user.github = action.payload;
        }
    }
});

export const { 
    setIsLoading,
    setIsCachedAuthLoading, 
    setGithubAccount,
    setUser, 
    setError,
    setIsOperationLoading,
    setIsAuthenticated 
} = authSlice.actions;

export default authSlice.reducer;