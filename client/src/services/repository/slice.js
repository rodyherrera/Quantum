import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    isOperationLoading: false,
    repositories: []
};

const repositorySlice = createSlice({
    name: 'repository',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        isOperationLoading: (state, action) => {
            state.isOperationLoading = action.payload;
        },
        setRepositories: (state, action) => {
            state.repositories = action.payload;
        },
        setIsOperationLoading: (state, action) => {
            state.isOperationLoading = action.payload;
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
    setIsOperationLoading
} = repositorySlice.actions;

export default repositorySlice.reducer;