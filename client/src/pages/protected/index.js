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

import github from './github';
import repository from './repository';
import general from './general';
import authentication from './authentication';
import dockerContainer from './dockerContainer';
import dockerImage from './dockerImage';
import dockerNetwork from './dockerNetwork';
import portBinding from './portBinding';

const pages = {
    github,
    portBinding,
    dockerContainer,
    dockerNetwork,
    dockerImage,
    repository,
    general,
    authentication
};

export default pages;