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

import Repository from '@models/repository';
import RuntimeError from '@utilities/runtimeError';
import { catchAsync } from '@utilities/runtime';
import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware to check if a user has access to a repository.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @throws {RuntimeError} - If user is not admin, if the repository is not found, or if it doesn't belong to the user. 
*/
export const verifyRepositoryAccess = catchAsync(async(req: Request,res: Response,next: NextFunction) => {
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
