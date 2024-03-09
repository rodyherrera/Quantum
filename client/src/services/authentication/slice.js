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
    // Stores the authenticated user's data
    user: {},
    // Authentication status flag
    isAuthenticated: false,
    // Tracks if initial state from local storage is being loaded
    isCachedAuthLoading: true,
    // General loading state for authentication processes
    isLoading: false,
    // Flag if account deletion is in progress
    isEliminatingAccount: false,
    // Tracks loading state for specific operations (e.g., updating profile)
    isOperationLoading: false,
    // Stores authentication-related errors
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState: state,
    reducers: {
        setIsEliminatingAccount: (state, action) => {
            state.isEliminatingAccount = action.payload;
        },
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
    setIsEliminatingAccount,
    setError,
    setIsOperationLoading,
    setIsAuthenticated 
} = authSlice.actions;

export default authSlice.reducer;