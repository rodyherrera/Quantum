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

const jwt = require('jsonwebtoken');
const User = require('@models/user');
const RuntimeError = require('@utilities/runtimeError');
const { promisify } = require('util');
const { catchAsync } = require('@utilities/runtime');

exports.getUserByToken = async (token) => {
    const decodedToken = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    const freshUser = await User.findById(decodedToken.id);
    if(!freshUser){
        return next(new RuntimeError('Authentication::User::NotFound', 401));
    }
    if(await freshUser.isPasswordChangedAfterJWFWasIssued(decodedToken.iat)){
        return next(new RuntimeError('Authentication::PasswordChanged', 401));
    }
    return freshUser;
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else{
        return next(new RuntimeError('Authentication::Required', 401));
    }
    const freshUser = await this.getUserByToken(token);
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new RuntimeError('Authentication::Unauthorized', 403));
        }
        next();
    };
};