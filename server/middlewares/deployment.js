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

const Deployment = require('@models/deployment');
const RuntimeError = require('@utilities/runtimeError');
const { catchAsync } = require('@utilities/runtime');

exports.verifyDeploymentAccess = catchAsync(async (req, res, next) => {
    const { user } = req;
    if(user.role === 'admin') return next();
    const { id } = req.params;
    const deployment = await Deployment.findOne({ _id: id, user: user._id });
    if(!deployment)
        throw new RuntimeError('Deployment::Not::Found', 404);
    next();
});