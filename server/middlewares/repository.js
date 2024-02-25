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

/**
 * Express middleware to check if a user has access to a repository.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @throws {RuntimeError} - If user is not admin, if the repository is not found, or if it doesn't belong to the user. 
*/
exports.verifyRepositoryAccess = catchAsync(async (req, res, next) => {
    const { user } = req;
    // Admins have access to all repositories
    if(user.role === 'admin') return next();
    const { id } = req.params;
    // Check if a repository with the provided ID exists and belongs to the user
    const repository = await Repository.findOne({ _id: id, user: user._id });
    if(!repository)
        throw new RuntimeError('Repository::Not::Found', 404);
    // TODO: Update HandlerFactory for do it.
    // req.repository = repository;
    // If all checks pass, store the repository on the request object for future use
    next();
});

module.exports = exports;