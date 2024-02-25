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

const passport = require('passport');
const RuntimeError = require('@utilities/runtimeError');

/**
 * Initiates the GitHub authentication process. Verifies the presence of a `userId`.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @throws {RuntimeError} - If the 'userId' query parameter is missing.
*/
exports.authenticate = (req, res, next) => {
    if(!req.query.userId){
        return next(new RuntimeError('Github::Missing::UserId', 400));
    }
    const userId = req.query.userId;
    req.session.userId = userId;
    passport.authenticate('github', { scope: ['user', 'repo'] })(req, res, next);
};

/**
 * Populates the 'github' property on the user object.
 *
 * @param {import('express').Request} req - Express request object (must have 'user').
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @throws {Error} - If the 'user' property doesn't exist on the request.
*/
exports.populateGithubAccount = async (req, res, next) => {
    if(!req.user){
        throw new Error('Authentication middleware chain error: Missing user');
    }
    req.user = await req.user.populate('github');
    next();
};

/**
 * Populates the 'repositories' property on the user object.
 *
 * @param {import('express').Request} req - Express request object (must have 'user').
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @throws {Error} - If the 'user' property doesn't exist on the request.
*/
exports.populateRepositories = async (req, res, next) => {
    if(!req.user){
        throw new Error('Authentication middleware chain error: Missing user');
    } 
    req.user = await req.user.populate('repositories');
    next();
};

/**
 * Finalizes the GitHub authentication flow. Handles success or failure.
*/
exports.authenticateCallback = passport.authenticate('github',  { failureRedirect: '/' });

module.exports = exports;