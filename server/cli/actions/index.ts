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

const actions = {
    createUser,
    dropDatabase,
    listCreatedContainers,
    listActiveContainers
};

export default actions;