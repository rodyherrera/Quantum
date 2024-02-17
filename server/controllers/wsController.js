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
const { PTYHandler, CloudConsoleHandler } = require('@utilities/ptyHandler');
const RuntimeError = require('@utilities/runtimeError');
const Repository = require('@models/repository');

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

const createShellHandler = (socket, shellInstance) => {
    const PTY = shellInstance;
    const shell = PTY.getOrCreate();
    socket.emit('history', PTY.getLog());
    socket.on('command', (command) => shell.write(command));
    shell.on('data', (data) => {
        if(PTY instanceof PTYHandler){
            data = data.replace(/.*#/g, PTY.getPrompt());
        } 
        PTY.appendLog(data);
        socket.emit('response', data);
    });
    socket.on('disconnect', () => {
        PTY.clearRuntimePTYLog();
    });
};

const repositoryShellHandler = (socket) => {
    const { repository, user } = socket;
    repository.user = user;
    const PTY = new PTYHandler(repository._id, repository);
    createShellHandler(socket, PTY);
};

const cloudConsoleHandler = async (socket) => {
    const { user } = socket;
    // GET OR CREATE FUNCTION HERE!
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