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

const { getUserByToken } = require('@middlewares/authentication');
const RuntimeError = require('@utilities/runtimeError');
const Repository = require('@models/repository');
const RepositoryHandler = require('@utilities/repositoryHandler');

/**
 * Authenticates user based on provided token.
 * @param {import('socket.io').Socket} socket - Socket.IO socket object.
 * @param {import('socket.io').NextFunction} next - Socket.IO next function.
*/
const userAuthentication = async (socket, next) => {
    const { token } = socket.handshake.auth;
    if(!token) return next(new RuntimeError('Authentication::Token::Required'));
    try{
        const user = await getUserByToken(token);
        socket.user = user;
    }catch(error){
        next(error);
    }
};

/**
 * Verifies user ownership of the requested repository.
 * @param {import('socket.io').Socket} socket - Socket.IO socket object.
 * @param {import('socket.io').NextFunction} next - Socket.IO next function.
*/
const tokenOwnership = async (socket, next) => {
    const { repositoryAlias } = socket.handshake.query;
    if(!repositoryAlias) return next(new RuntimeError('Repository::Name::Required'));
    try{
        const repository = await Repository.findOne({ alias: repositoryAlias, user: socket.user._id });
        if(!repository) return next(new RuntimeError('Repository::Not::Found'));
        socket.repository = repository;
        next();
    }catch(error){
        next(error);
    }

};

/**
 * Handles repository interactive shell connections.
 * @param {import('socket.io').Socket} socket - Socket.IO socket object.
*/
const repositoryShellHandler = async (socket) => {
    try{
        const { repository, user } = socket;
        const repositoryHandler = new RepositoryHandler(repository, user);
        await repositoryHandler.executeInteractiveShell(socket);
    }catch(error){
        console.log('[Quantum Cloud]: Critical Error (@controllers/wsController - repositoryShellHandler)', error);
    }
};

/**
 * Handles cloud console connections.
 * @param {import('socket.io').Socket} socket - Socket.IO socket object.
*/
const cloudConsoleHandler = async (socket) => {
    try{
        const { user } = socket;
        const container = global.userContainers[user._id];
        await container.executeInteractiveShell(socket);
    }catch(error){
        console.log('[Quantum Cloud]: Critical Error (@controllers/wsController - cloudConsoleHandler)', error);
    }
};

module.exports = (io) => {
    io.use(userAuthentication);
    io.on('connection', async (socket) => {
        const { action } = socket.handshake.query;
        if(action === 'Repository::Shell'){
            await tokenOwnership(socket, (error) => {
                if(error){
                    console.log('[Quantum Cloud]: Critical Error (@controllers/wsController)', error);
                }
                else repositoryShellHandler(socket);
            });
        }else if(action === 'Cloud::Console'){
            cloudConsoleHandler(socket);
        }else{
            socket.disconnect();
        }
    });
};