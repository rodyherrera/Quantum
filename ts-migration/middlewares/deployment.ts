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

import Deployment from '@models/deployment';
import RuntimeError from '@utilities/runtimeError';
import { catchAsync } from '@utilities/runtime';
import { IUser } from '@models/user';
import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware to check if a user has access to a deployment.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @throws {RuntimeError} - If user is not admin and the deployment is not found or if it doesn't belong to the user. 
 */
export const verifyDeploymentAccess = catchAsync(async (req:Request,res:Response,next:NextFunction) => {
    const user = req.user as IUser;
    // Admins have access to all deployments
    if(user.role === 'admin') return next();
    const { id } = req.params;
    // Check if a deployment with the provided ID exists and belongs to the user
    const deployment = await Deployment.findOne({_id:id,user:user._id});
    if(!deployment){
        throw new RuntimeError('Deployment::Not::Found',404);
    }
    // If all checks pass, proceed to the next middleware
    next();
});
