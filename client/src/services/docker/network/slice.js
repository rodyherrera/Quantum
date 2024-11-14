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
    selectedDockerNetwork: {},
    dockerNetworks: [],
    networkStats: {},
};

const dockerNetworkSlice = createSlice({
    name: 'dockerContainer',
    initialState: state,
    reducers: {
        setState: reduxUtils.setState
    }
});

export const {
    setState
} = dockerNetworkSlice.actions;

export default dockerNetworkSlice.reducer;