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

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@services/authentication/slice';
import githubReducer from '@services/github/slice';
import repositoryReducer from '@services/repository/slice';
import deploymentReducer from '@services/deployment/slice';
import coreReducer from '@services/core/slice';

/**
 * @function configureStore 
 * @description Configures the Redux store for the Quantum Cloud application.
 * @param {Object} options - Configuration options for the Redux store.
 * @param {Object} options.reducer - A combined reducer object containing slices of state for different application areas.
 * @returns {Store} The configured Redux store.
*/
const store = configureStore({
    reducer: {
        core: coreReducer,
        auth: authReducer,
        github: githubReducer,
        repository: repositoryReducer,
        deployment: deploymentReducer
    }
});

export default store;