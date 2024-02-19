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
    isMenuEnabled: false,
    isCloudConsoleEnabled: false,
    errors: [],
    isServerHealthLoading: true,
    serverHealth: null,
    error: null
};

const coreSlice = createSlice({
    name: 'core',
    initialState: state,
    reducers: {
        setIsMenuEnabled: (state, action) => {
            state.isMenuEnabled = action.payload;
        },
        setIsCloudConsoleEnabled: (state, action) => {
            state.isCloudConsoleEnabled = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setIsServerHealthLoading: (state, action) => {
            state.isServerHealthLoading = action.payload;
        },
        setServerHealth: (state, action) => {
            state.serverHealth = action.payload;
        },
        addError: (state, action) => {
            const error = action.payload;
            state.errors.push(error);
        },
        removeError: (state, action) => {
            const errorId = action.payload;
            state.errors = state.errors.filter((error) => error.id !== errorId);
        }
    }
});

export const {
    setIsMenuEnabled,
    setServerHealth,
    setIsServerHealthLoading,
    setError,
    setIsCloudConsoleEnabled,
    addError,
    removeError
} = coreSlice.actions;

export default coreSlice.reducer;