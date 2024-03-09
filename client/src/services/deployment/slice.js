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
    // Stores deployment-related errors
    error: null,
    // Tracks overall loading state for deployment data
    isLoading: true,
    // Tracks loading state for deployment actions (start, restart, etc.)
    isOperationLoading: false,
    // Tracks if the deployment environment is being fetched
    isEnvironmentLoading: true,
    // Array to store deployment information
    deployments: [],
    // Stores details about the deployment environment
    environment: {}
};

const deploymentSlice = createSlice({
    name: 'deployment',
    initialState: state,
    reducers: {
        setEnvironment: (state, action) => {
            state.environment = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setIsEnvironmentLoading: (state, action) => {
            state.isEnvironmentLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setDeployments: (state, action) => {
            state.deployments = action.payload;
        },
        setIsOperationLoading: (state, action) => {
            state.isOperationLoading = action.payload;
        }
    }
});

export const {
    setError,
    setIsEnvironmentLoading,
    setIsOperationLoading,
    setEnvironment,
    setIsLoading,
    setDeployments
} = deploymentSlice.actions;

export default deploymentSlice.reducer;