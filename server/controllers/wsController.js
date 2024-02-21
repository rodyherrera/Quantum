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

const userAuthentication = async (socket, next) => {
    const { token } = socket.handshake.auth;
    if(!token) return next(new RuntimeError('Authentication::Token::Required'));
    const user = await getUserByToken(token);
    socket.user = user;
    next();
};

const tokenOwnership = async (socket, next) => {
    const { repositoryAlias } = socket.handshake.query;
    if(!repositoryAlias) return next(new RuntimeError('Repository::Name::Required'));
    const repository = await Repository.findOne({ alias: repositoryAlias, user: socket.user._id });
    if(!repository) return next(new RuntimeError('Repository::Not::Found'));
    socket.repository = repository;
    next();
};

const repositoryShellHandler = async (socket) => {
    const { repository, user } = socket;
    const repositoryHandler = new RepositoryHandler(repository, user);
    await repositoryHandler.executeInteractiveShell(socket);
};

const cloudConsoleHandler = async (socket) => {
    const { user } = socket;
    const container = global.userContainers[user._id];
    await container.executeInteractiveShell(socket);
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