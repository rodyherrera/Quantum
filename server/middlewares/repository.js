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

const Repository = require('@models/repository');
const RuntimeError = require('@utilities/runtimeError');
const { catchAsync } = require('@utilities/runtime');

exports.verifyRepositoryAccess = catchAsync(async (req, res, next) => {
    const { user } = req;
    if(user.role === 'admin') return next();
    const { id } = req.params;
    const repository = await Repository.findOne({ _id: id, user: user._id });
    if(!repository)
        throw new RuntimeError('Repository::Not::Found', 404);
    // TODO: Update HandlerFactory for do it.
    // req.repository = repository;
    next();
});