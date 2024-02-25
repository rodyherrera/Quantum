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

/**
 * Express middleware to check if a user has access to a deployment.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @throws {RuntimeError} - If user is not admin and the deployment is not found or if it doesn't belong to the user. 
*/
exports.verifyDeploymentAccess = catchAsync(async (req, res, next) => {
    const { user } = req;
    // Admins have access to all deployments
    if(user.role === 'admin') return next();
    const { id } = req.params;
    // Check if a deployment with the provided ID exists and belongs to the user
    const deployment = await Deployment.findOne({ _id: id, user: user._id });
    if(!deployment){
        throw new RuntimeError('Deployment::Not::Found', 404);
    }
    // If all checks pass, proceed to the next middleware
    next();
});