import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    isCreatingRepo: false,
    repositories: []
};

const repositorySlice = createSlice({
    name: 'repository',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setIsCreatingRepo: (state, action) => {
            state.isCreatingRepo = action.payload;
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
    setRepositories,
    setIsCreatingRepo
} = repositorySlice.actions;

export default repositorySlice.reducer;