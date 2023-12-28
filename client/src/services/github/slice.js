import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true
};

const githubSlice = createSlice({
    name: 'github',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setError,
    setIsLoading
} = githubSlice.actions;

export default githubSlice.reducer;