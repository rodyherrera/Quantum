import { createSlice } from '@reduxjs/toolkit';

const state = {
    user: {},
    isAuthenticated: false,
    isLoading: true
};

const authenticationSlice = createSlice({
    name: 'authentication',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
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
    setUser, 
    setIsAuthenticated 
} = authenticationSlice.actions;

export default authenticationSlice.reducer;