import { createSlice } from '@reduxjs/toolkit';

const state = {
    user: {},
    isAuthenticated: false,
    isCachedAuthLoading: true,
    isLoading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState: state,
    reducers: {
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
            console.log('OK', state.user);
        }
    }
});

export const { 
    setIsLoading,
    setIsCachedAuthLoading, 
    setGithubAccount,
    setUser, 
    setError,
    setIsAuthenticated 
} = authSlice.actions;

export default authSlice.reducer;