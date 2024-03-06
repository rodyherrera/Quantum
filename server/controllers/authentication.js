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
const HandlerFactory = require('@controllers/handlerFactory');
const { catchAsync, filterObject } = require('@utilities/runtime');

const UserFactory = new HandlerFactory({
    model: User,
    fields: [
        'username',
        'fullname',
        'github',
        'email',
        'password',
        'passwordConfirm',
    ]
});

/**
 * Generates a JSON Web Token (JWT) for authentication.
 *
 * @param {string} identifier - The user's unique identifier (typically their database ID).
 * @returns {string} - The signed JWT.
*/
const signToken = (identifier) => {
    return jwt.sign({ id: identifier }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRATION_DAYS
    })
};

/**
 * Creates a new JWT and sends it in the response along with user data.
 * 
 * @param {Object} res - The Express response object.
 * @param {number} statusCode - HTTP status code to send in the response.
 * @param {Object} user - The user object to include in the response.
*/
const createAndSendToken = (res, statusCode, user) => {
    const token = signToken(user._id);
    user.password = undefined;
    user.__v = undefined;
    res.status(statusCode).json({
        status: 'success',
        data: { token, user }
    });
};

/**
 * Handles user sign-in requests. Authenticates the user based on email and password. 
 * If successful, generates and sends a JWT.
 *
 * @returns {Promise<void>}
*/
exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new Error('Authentication::EmailOrPasswordRequired'));
    }
    const requestedUser = await User.findOne({ email }).select('+password').populate('github');
    if(!requestedUser || !(await requestedUser.isCorrectPassword(password, requestedUser.password))){
        return next(new Error('Authentication::EmailOrPasswordIncorrect', 401));
    }
    createAndSendToken(res, 200, requestedUser);
});

/**
 * Handles user sign-up requests. Creates a new user in the database and sends a JWT in the response.
 * 
 * @returns {Promise<void>}
*/
exports.signUp = catchAsync(async (req, res, next) => {
    const { username, fullname, email, password, passwordConfirm } = req.body;
    if(process.env.REGISTRATION_DISABLED === 'true'){
        return next(new Error('Authentication::Disabled'));
    }
    const newUser = await User.create({ username, fullname, email, password, passwordConfirm });
    createAndSendToken(res, 201, newUser);
});

/**
 * Updates the authenticated user's password. Verifies the current password and ensures the new password is different. 
 * Updates the user record and sends a JWT with the updated user data.
 *
 * @returns {Promise<void>}
*/
exports.updateMyPassword = catchAsync(async (req, res, next) => {
    const requestedUser = await User.findById(req.user.id).select('+password').populate('github');
    // Verify if the current password provided by the user is indeed the current password of the account.
    if(!(await requestedUser.isCorrectPassword(req.body.passwordCurrent, requestedUser.password))){
        return next(new Error('Authentication::Update::PasswordCurrentIncorrect'));
    }
    // Check if the new password is different from the current account password. 
    // If the return of the function is true, it means that they are the same.
    if(await requestedUser.isCorrectPassword(req.body.passwordConfirm, requestedUser.password)){
        return next(new Error('Authentication::Update::PasswordsAreSame'));
    }
    requestedUser.password = req.body.password;
    requestedUser.passwordConfirm = req.body.passwordConfirm;
    await requestedUser.save();
    createAndSendToken(res, 200, requestedUser);
});

/**
 * Deletes the authenticated user's account.
 *
 * @returns {Promise<void>}
*/
exports.deleteMyAccount = catchAsync(async (req, res, next) => {
    const requestedUser = await User.findByIdAndDelete(req.user.id);
    if(!requestedUser){
        return next(new Error('Authentication::Delete::UserNotFound'));
    }
    res.status(204).json({
        status: 'success',
        data: requestedUser
    });
});

/**
 * Retrieves the authenticated user's profile. 
 *
 * @returns {Promise<void>}
*/
exports.getMyAccount = catchAsync(async (req, res, next) => {
    const requestedUser = await User.findById(req.user.id).populate('github');
    if(!requestedUser){
        return next(new Error('Authentication::Get::UserNotFound'));
    }
    res.status(200).json({
        status: 'success',
        data: requestedUser
    });
});

/**
 * Updates the authenticated user's profile. Allows updates to username, fullname, and email. 
 * 
 * @returns {Promise<void>}
*/
exports.updateMyAccount = catchAsync(async (req, res, next) => {
    const filteredBody = filterObject(req.body, 'username', 'fullname', 'email');
    const requestedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }).populate('github');
    if(!requestedUser){
        return next(new Error('Authentication::Update::UserNotFound'));
    }
    res.status(200).json({
        status: 'success',
        data: requestedUser
    });
});

exports.deleteUser = UserFactory.deleteOne();
exports.getUser = UserFactory.getOne();
exports.getAllUsers = UserFactory.getAll();
exports.updateUser = UserFactory.updateOne();
exports.createUser = UserFactory.createOne();

module.exports = exports;