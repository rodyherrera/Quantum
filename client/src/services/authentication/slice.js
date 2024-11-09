import { createSlice } from '@reduxjs/toolkit';
import * as reduxUtils from '@utilities/common/reduxUtils';

const initialState = {
    user: {},
    authStatus: {
        isAuthenticated: false,
        isCachedAuthLoading: true,
        isEliminatingAccount: false
    },
    loadingStatus: {
        isLoading: false,
        isOperationLoading: false
    },
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setState: reduxUtils.setState
    }
});

export const { 
    setState
} = authSlice.actions;

export default authSlice.reducer;