import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    isCreatingRepo: false,
    isUpdatingRepo: false,
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
        setIsUpdatingRepo: (state, action) => {
            state.isUpdatingRepo = action.payload;
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
    setIsCreatingRepo,
    setIsUpdatingRepo
} = repositorySlice.actions;

export default repositorySlice.reducer;