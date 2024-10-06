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

import createUser from '@cli/actions/createUser';
import dropDatabase from '@cli/actions/dropDatabase';
import listActiveContainers from '@cli/actions/listActiveContainers';
import listCreatedContainers from '@cli/actions/listCreatedContainers';
import listCreatedDockerNetworks from '@cli/actions/listCreatedDockerNetworks';
import removeCreatedDockerNetworks from '@cli/actions/removeCreatedNetworks';
import removeContainers from '@cli/actions/removeContainers';

const actions = {
    createUser,
    removeContainers,
    removeCreatedDockerNetworks,
    dropDatabase,
    listCreatedDockerNetworks,
    listCreatedContainers,
    listActiveContainers
};

export default actions;