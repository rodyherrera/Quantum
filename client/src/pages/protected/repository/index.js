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

import CreateRepository from './CreateRepository';
import RepositoryDeployments from './RepositoryDeployments';
import SetupDeployment from './SetupDeployment';
import EnvironmentVariables from './EnvironmentVariables';
import RepositoryDomains from './RepositoryDomains';
import Storage from './Storage';
import Shell from './Shell';

const pages = {
    CreateRepository,
    RepositoryDomains,
    EnvironmentVariables,
    RepositoryDeployments,
    Storage,
    SetupDeployment,
    Shell
};

export default pages;