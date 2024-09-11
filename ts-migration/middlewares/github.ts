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

import passport from 'passport';
import RuntimeError from '@utilities/runtimeError';
import { Request, Response, NextFunction } from 'express';

/**
 * Initiates the GitHub authentication process. Verifies the presence of a `userId`.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @throws {RuntimeError} - If the 'userId' query parameter is missing.
*/
export const authenticate = (req: Request,res: Response,next: NextFunction): void => {
    if(!req.query.userId){
        return next(new RuntimeError('Github::Missing::UserId',400));
    }
    const userId = req.query.userId as string;
    req.session.userId = userId;
    passport.authenticate('github',{ scope:['user','repo'] })(req,res,next);
};

/**
 * Populates the 'github' property on the user object.
 *
 * @param {Request} req - Express request object (must have 'user').
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @throws {Error} - If the 'user' property doesn't exist on the request.
*/
export const populateGithubAccount = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    if(!req.user){
        throw new Error('Authentication middleware chain error: Missing user');
    }
    req.user = await req.user.populate('github');
    next();
};

/**
 * Populates the 'repositories' property on the user object.
 *
 * @param {Request} req - Express request object (must have 'user').
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @throws {Error} - If the 'user' property doesn't exist on the request.
*/
export const populateRepositories = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    if(!req.user){
        throw new Error('Authentication middleware chain error: Missing user');
    } 
    req.user = await req.user.populate('repositories');
    next();
};

/**
 * Finalizes the GitHub authentication flow. Handles success or failure.
*/
export const authenticateCallback = passport.authenticate('github',{ failureRedirect:'/' });
