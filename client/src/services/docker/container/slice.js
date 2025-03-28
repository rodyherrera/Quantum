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
    isContainersByStatusLoading: true,
    containersByStatus: { running: 0, restarting: 0, stopped: 0 },
    isLoading: true,
    randomAvailablePort: 0,
    isRandomAvailablePortLoading: true,
    isOperationLoading: false,
    stats: {},
    isOneClickDeployLoading: false,
    dockerContainers: [],
    containerFiles: [],
    selectedContainerFile: null,
    selectedDockerContainer: {}
};

const dockerContainerSlice = createSlice({
    name: 'dockerContainer',
    initialState: state,
    reducers: {
        setState: reduxUtils.setState,
    }
});

export const {
    setState
} = dockerContainerSlice.actions;

export default dockerContainerSlice.reducer;