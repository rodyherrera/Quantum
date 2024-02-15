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

const moduleAlias = require('module-alias');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

moduleAlias.addAliases({
    '@utilities': `${__dirname}/utilities/`,
    '@routes': `${__dirname}/routes/`,
    '@cli': `${__dirname}/cli/`,
    '@models': `${__dirname}/models/`,
    '@middlewares': `${__dirname}/middlewares/`,
    '@config': `${__dirname}/config/`,
    '@controllers': `${__dirname}/controllers/`
});