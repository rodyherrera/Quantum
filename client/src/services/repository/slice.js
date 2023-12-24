import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    repositories: []
};

const repositorySlice = createSlice({
    name: 'repository',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setRepositories: (state, action) => {
            state.repositories = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setError,
    setIsLoading,
    setRepositories
} = repositorySlice.actions;

export default repositorySlice.reducer;