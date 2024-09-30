import { createSlice } from '@reduxjs/toolkit';
import * as reduxUtils from '@utilities/common/reduxUtils'; 

const initialState = {
    error: null,
    isLoading: true,
    isOperationLoading: false,
    isEnvironmentLoading: true,
    deployments: [],
    environment: {}
};

const deploymentSlice = createSlice({
    name: 'deployment',
    initialState,
    reducers: {
        setState: reduxUtils.setState,
    }
});

export const {
    setState,
} = deploymentSlice.actions;

export default deploymentSlice.reducer;
