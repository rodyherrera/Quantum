import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    isOperationLoading: false,
    isEnvironmentLoading: true,
    deployments: [],
    environmentVariables: []
};

const deploymentSlice = createSlice({
    name: 'deployment',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setIsEnvironmentLoading: (state, action) => {
            state.isEnvironmentLoading = action.payload;
        },
        setEnvironmentVariables: (state, action) => {
            state.environmentVariables = action.payload;
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
    setIsLoading,
    setDeployments,
    setEnvironmentVariables
} = deploymentSlice.actions;

export default deploymentSlice.reducer;