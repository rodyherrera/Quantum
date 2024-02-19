/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import { createSlice } from '@reduxjs/toolkit';

const state = {
    error: null,
    isLoading: true,
    isOperationLoading: false,
    repositories: [],
    repositoryFiles: [],
    githubRepositories: [],
    selectedRepository: null,
    selectedRepositoryFile: null,
};

const repositorySlice = createSlice({
    name: 'repository',
    initialState: state,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setSelectedRepository: (state, action) => {
            state.selectedRepository = action.payload;
        },
        setGithubRepositories: (state, action) => {
            state.githubRepositories = action.payload;
        },
        setRepositoryFiles: (state, action) => {
            state.repositoryFiles = action.payload;
        },
        setSelectedRepositoryFile: (state, action) => {
            state.selectedRepositoryFile = action.payload;
        },
        isOperationLoading: (state, action) => {
            state.isOperationLoading = action.payload;
        },
        setRepositories: (state, action) => {
            state.repositories = action.payload;
        },
        updateDeploymentStatus: (state, action) => {
            const { _id, status } = action.payload;
            state.repositories = state.repositories.map((repository) => {
                if(repository._id === _id){
                    repository.activeDeployment.status = status;
                }
                return repository;
            });
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
    setSelectedRepositoryFile,
    setRepositoryFiles,
    updateDeploymentStatus,
    setIsLoading,
    setGithubRepositories,
    setRepositories,
    setSelectedRepository,
    setIsOperationLoading
} = repositorySlice.actions;

export default repositorySlice.reducer;