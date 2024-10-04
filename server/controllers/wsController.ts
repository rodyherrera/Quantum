import { getUserByToken } from '@middlewares/authentication';
import { ISocket, WsNextFunction } from '@typings/controllers/wsController';
import UserContainer from '@services/userContainer';
import RuntimeError from '@utilities/runtimeError';
import DockerContainerService from '@services/docker/container';
import Repository from '@models/repository';
import RepositoryHandler from '@services/repositoryHandler';
import DockerContainer from '@models/docker/container';
import logger from '@utilities/logger';

const authenticateUser = async (socket: ISocket, next: WsNextFunction) => {
    const { token } = socket.handshake.auth;
    if(!token) return next(new RuntimeError('Authentication::Token::Required', 400));
    try{
        socket.user = await getUserByToken(token);
        next();
    }catch(error){
        next(error);
    }
};

const checkRepositoryOwnership = async (socket: ISocket, next: WsNextFunction) => {
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

const handleShell = async (socket: ISocket) => {
    try{
        const repositoryHandler = new RepositoryHandler(socket.repository, socket.user);
        await repositoryHandler.executeInteractiveShell(socket);
    }catch(error){
        logger.info('Critical Error (@controllers/wsController - handleShell): ' + error);
    }
};

const handleDockerShell = async (socket: ISocket) => {
    try{
        const { dockerId } = socket.handshake.query;
        const dockerContainer = await DockerContainer.findById(dockerId);
        if(dockerContainer && dockerId){
            const dockerHandler = new DockerContainerService(dockerContainer);
            dockerHandler.startSocketShell(socket, '/');
        }
    }catch(error){
        logger.info('Critical Error (@controllers/wsController - handleDockerShell): ' + error);
    }
};

const handleCloudConsole = async (socket: ISocket) => {
    try{
        const container = new UserContainer(await socket.user.populate('container'));
        await container.executeInteractiveShell(socket);
    }catch (error){
        logger.error('Critical Error (@controllers/wsController - handleCloudConsole): ' + error);
    }
};

export default (io: any) => {
    io.use(authenticateUser);
    io.on('connection', async (socket: ISocket) => {
        socket.emit('connected');
        const { action } = socket.handshake.query;
        switch(action){
            case 'Repository::Shell':
                await checkRepositoryOwnership(socket, async (error) => {
                    if(!error) handleShell(socket);
                    else logger.error('Error in repositoryShell:', error);
                });
                break;
            case 'Cloud::Console':
                handleCloudConsole(socket);
                break;
            case 'DockerContainer::Shell':
                handleDockerShell(socket);
                break;
            default:
                socket.disconnect();
        }
    });
};
