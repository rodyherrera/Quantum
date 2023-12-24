import { createSlice } from '@reduxjs/toolkit';

const state = {
    user: {},
    isAuthenticated: false,
    isCachedAuthenticationLoading: true,
    isLoading: false,
    error: null
};

const authenticationSlice = createSlice({
    name: 'authentication',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setIsCachedAuthenticationLoading(state, action) {
            state.isCachedAuthenticationLoading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        }
    }
});

export const { 
    setIsLoading,
    setIsCachedAuthenticationLoading, 
    setUser, 
    setError,
    setIsAuthenticated 
} = authenticationSlice.actions;

export default authenticationSlice.reducer;