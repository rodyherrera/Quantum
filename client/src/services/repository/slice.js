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
import * as reduxUtils from '@utilities/common/reduxUtils';

const state = {
    error: null,
    isLoading: true,
    isOperationLoading: false,
    stats: {},
    repositories: [],
    repositoryFiles: [],
    githubRepositories: [],
    selectedRepository: null,
    selectedRepositoryFile: null
};

const repositorySlice = createSlice({
    name: 'repository',
    initialState: state,
    reducers: {
        updateRepositories(state, action){
            const { repository, status } = action.payload;
            const repositories = state.repositories.map((stateRepo) => {
                if(stateRepo._id === repository._id){
                    stateRepo.activeDeployment.status = status;
                }
                return stateRepo;
            });
            state.repositories = repositories;
        },
        setState: reduxUtils.setState
    }
});

export const {
    setState,
    updateRepositories
} = repositorySlice.actions;

export default repositorySlice.reducer;