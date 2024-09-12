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

import { Socket } from 'socket.io';
import { getUserByToken } from '@middlewares/authentication';
import RuntimeError from '@utilities/runtimeError';
import Repository from '@models/repository';
import RepositoryHandler from '@services/repositoryHandler';
import logger from '@utilities/logger';

/**
 * Authenticates user based on provided token.
 * @param {Socket} socket - Socket.IO socket object.
 * @param {NextFunction} next - next function.
*/
const userAuthentication = async (socket: Socket, next) => {
    const { token } = socket.handshake.auth;
    if(!token)return next(new RuntimeError('Authentication::Token::Required', 400));
    try{
        const user = await getUserByToken(token, next);
        socket.user = user;
        next();
    }catch(error){
        next(error);
    }
};

/**
 * Verifies user ownership of the requested repository.
 * @param {Socket} socket - Socket.IO socket object.
 * @param {NextFunction} next - next function.
*/
const tokenOwnership = async (socket: Socket, next) => {
    const { repositoryAlias } = socket.handshake.query;
    if(!repositoryAlias)return next(new RuntimeError('Repository::Name::Required', 400));
    try{
        const repository = await Repository.findOne({ alias: repositoryAlias, user: socket.user._id });
        if(!repository)return next(new RuntimeError('Repository::Not::Found', 404));
        socket.repository = repository;
        next();
    }catch(error){
        next(error);
    }
};

/**
 * Handles repository interactive shell connections.
 * @param {Socket} socket - Socket.IO socket object.
*/
const repositoryShellHandler = async (socket: Socket) => {
    try{
        const { repository, user } = socket;
        const repositoryHandler = new RepositoryHandler(repository, user);
        await repositoryHandler.executeInteractiveShell(socket);
    }catch(error){
        logger.info('Critical Error (@controllers/wsController - repositoryShellHandler)', error);
    }
};

/**
 * Handles cloud console connections.
 * @param {Socket} socket - Socket.IO socket object.
*/
const cloudConsoleHandler = async (socket: Socket) => {
    try{
        const { user } = socket;
        const container = (global as any).userContainers[user._id];
        await container.executeInteractiveShell(socket);
    }catch(error){
        logger.info('Critical Error (@controllers/wsController - cloudConsoleHandler)', error);
    }
};

export default (io: any) => {
    io.use(userAuthentication);
    io.on('connection', async (socket: Socket) => {
        const { action } = socket.handshake.query;
        if(action === 'Repository::Shell'){
            await tokenOwnership(socket, (error) => {
                if(error){
                    logger.info('Critical Error (@controllers/wsController)', error);
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