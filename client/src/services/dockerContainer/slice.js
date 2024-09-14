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
    error: null,
    isLoading: true,
    isOperationLoading: false,
    dockerContainers: []
};

const dockerContainerSlice = createSlice({
    name: 'dockerContainer',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setDockerContainers: (state, action) => {
            state.dockerContainers = action.payload;
        },
        setIsOperationLoading: (state, action) => {
            state.isOperationLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setIsOperationLoading,
    setError,
    setIsLoading,
    setDockerContainers
} = dockerContainerSlice.actions;

export default dockerContainerSlice.reducer;