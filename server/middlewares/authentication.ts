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

import jwt from 'jsonwebtoken';
import User from '@models/user';
import RuntimeError from '@utilities/runtimeError';
import { IDecodedToken } from '@typings/middlewares/authentication';
import { IUser } from '@typings/models/user';
import { catchAsync } from '@utilities/helpers';
import { Request, Response, NextFunction } from 'express';
import logger from '@utilities/logger';

/**
 * Extracts and verifies a JWT token from the Authorization header, then retrieves
 * the corresponding user.
 *
 * @param {string} token - The JWT token to verify and decode.
 * @returns {Promise<object>} - The user object if found, otherwise throws an error.
 * @throws {RuntimeError} - If the user is not found or password has changed after 
 *                          the token was issued.
 */
export const getUserByToken = async (token: string): Promise<IUser> => {
    if(!process.env.SECRET_KEY){
        logger.error('process.env.SECRET_KEY is empty!');
        throw new RuntimeError('Authentication::SecretKey::Empty', 500);
    }
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY) as IDecodedToken;
    // Retrieve the user from the database
    const freshUser = await User.findById(decodedToken.id);
    if(!freshUser){
        throw new RuntimeError('Authentication::User::NotFound', 401);
    }
    // Check if the user's password has changed since the token was issued
    if(freshUser.isPasswordChangedAfterJWFWasIssued(decodedToken.iat)){
        throw new RuntimeError('Authentication::PasswordChanged', 401);
    }
    return freshUser;
};

/**
 * Express middleware to protect routes. Fetches and validates a JWT token.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - Express next function to continue.
 * @throws {RuntimeError} - If no token provided or if authentication fails.
 */
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Retrieve token from the request headers
    let token: string | undefined;
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else{
        return next(new RuntimeError('Authentication::Required',401));
    }
    // 2. Verify token and retrieve the user
    const freshUser = await getUserByToken(token);
    // 3. Attach the user to the request object for subsequent middleware to use
    req.user = freshUser;
    next();
});

/**
 * Authorization middleware to restrict access based on user roles.
 *
 * @param {...string} roles - The allowed roles for the route.
 * @returns {RequestHandler} - Express middleware function.
 */
export const restrictTo = (...roles:string[]):((req: Request, res: Response, next: NextFunction) => void) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Check if the user role matches any allowed roles
        if(!roles.includes((req.user as IUser).role)){
            return next(new RuntimeError('Authentication::Unauthorized',403));
        }
        next();
    };
};
