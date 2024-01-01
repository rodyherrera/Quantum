import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: false,
    deployments: []
};

const deploymentSlice = createSlice({
    name: 'deployment',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setDeployments: (state, action) => {
            state.deployments = action.payload;
        }
    }
});

export const {
    setError,
    setIsLoading,
    setDeployments
} = deploymentSlice.actions;

export default deploymentSlice.reducer;