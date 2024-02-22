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

const createUser = require('@cli/actions/createUser');
const dropDatabase = require('@cli/actions/dropDatabase');
const listActiveContainers = require('@cli/actions/listActiveContainers');
const listCreatedContainers = require('@cli/actions/listCreatedContainers');

const actions = {
    createUser,
    listActiveContainers,
    dropDatabase,
    listCreatedContainers
};

module.exports = actions;