import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    isOperationLoading: false,
    isEnvironmentLoading: true,
    deployments: [],
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