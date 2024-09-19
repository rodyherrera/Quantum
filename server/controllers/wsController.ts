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

import { getUserByToken } from '@middlewares/authentication';
import { ISocket, WsNextFunction } from '@typings/controllers/wsController';
import UserContainer from '@services/userContainer';
import RuntimeError from '@utilities/runtimeError';
import DockerContainerService from '@services/docker/container';
import Repository from '@models/repository';
import RepositoryHandler from '@services/repositoryHandler';
import DockerContainer from '@models/docker/container';
import logger from '@utilities/logger';

const userAuthentication = async (socket: ISocket, next: WsNextFunction) => {
    const { token } = socket.handshake.auth;
    if(!token) return next(new RuntimeError('Authentication::Token::Required', 400));
    try{
        const user = await getUserByToken(token);
        socket.user = user;
        next();
    }catch(error: any){
        next(error);
    }
};

const tokenOwnership = async (socket: ISocket, next: WsNextFunction) => {
    const { repositoryAlias } = socket.handshake.query;
    if(!repositoryAlias) return next(new RuntimeError('Repository::Name::Required', 400));
    try{
        const repository = await Repository.findOne({ alias: repositoryAlias, user: socket.user._id });
        if(!repository) return next(new RuntimeError('Repository::Not::Found', 404));
        socket.repository = repository;
        next();
    }catch(error){
        next(error);
    }
};

const repositoryShellHandler = async (socket: ISocket) => {
    try{
        const { repository, user } = socket;
        const repositoryHandler = new RepositoryHandler(repository, user);
        await repositoryHandler.executeInteractiveShell(socket);
    }catch(error){
        logger.info('Critical Error (@controllers/wsController - repositoryShellHandler)', error);
    }
};

const dockerContainerShellHandler = async (socket: ISocket) => {
    try{
        const { dockerId } = socket.handshake.query;
        const dockerContainer = await DockerContainer.findById(dockerId);
        if(!dockerContainer || !dockerId){
            // handle next function
            return;
        }
        const dockerHandler = new DockerContainerService(dockerContainer);
        dockerHandler.startSocketShell(socket, '/');
    }catch(error){
        logger.info('Critical Error (@controllers/wsController - dockerContainerShellHandler)', error);
    }
};

const cloudConsoleHandler = async (socket: ISocket) => {
    try{
        const { user } = socket;
        const populatedUser = await user.populate('container');
        const container = new UserContainer(populatedUser);
        await container.executeInteractiveShell(socket);
    }catch(error){
        logger.error('Critical Error (@controllers/wsController - cloudConsoleHandler)', error);
    }
};

export default (io: any) => {
    io.use(userAuthentication);
    io.on('connection', async (socket: ISocket) => {
        socket.emit('connected');
        const { action } = socket.handshake.query;
        if(action === 'Repository::Shell'){
            await tokenOwnership(socket, async (error): Promise<void> => {
                if(error){
                    logger.error('Critical Error (@controllers/wsController)', error);
                }
                else repositoryShellHandler(socket);
            });
        }else if(action === 'Cloud::Console'){
            cloudConsoleHandler(socket);
        }else if(action === 'DockerContainer::Shell'){
            // TOOD: verify ownership
            dockerContainerShellHandler(socket);
        }else{
            socket.disconnect();
        }
    });
};