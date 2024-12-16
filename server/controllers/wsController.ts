import { getUserByToken } from '@middlewares/authentication';
import { ISocket, WsNextFunction } from '@typings/controllers/wsController';
import UserContainer from '@services/userContainer';
import RuntimeError from '@utilities/runtimeError';
import DockerContainerService from '@services/docker/container';
import Repository from '@models/repository';
import DockerContainer from '@models/docker/container';
import logger from '@utilities/logger';

const authenticateUser = async (socket: ISocket, next: WsNextFunction) => {
    const cookies = socket.request.headers.cookie;
    const jwtCookie = cookies
        ?.split('; ')
        .find((cookie) => cookie.startsWith('jwt='))
        ?.split('=')[1];    
    if(!jwtCookie) return next(new RuntimeError('Authentication::Token::Required', 400));
    try{
        socket.user = await getUserByToken(jwtCookie);
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

const handleDockerShell = async (socket: ISocket) => {
    try{
        let dockerContainer;
        let workDir = '/';
        if(socket.repository){
            dockerContainer = await DockerContainer.findOne({ repository: socket.repository });
            workDir = `/app/${socket.repository.rootDirectory}`;
        }else{
            const { dockerId } = socket.handshake.query;
            dockerContainer = await DockerContainer.findById(dockerId);
        }
        if(dockerContainer){
            const dockerHandler = new DockerContainerService(dockerContainer);
            dockerHandler.startSocketShell(socket, workDir);
        }
    }catch(error){
        logger.info('@controllers/wsController.ts (handleDockerShell): ' + error);
    }
};

const handleCloudConsole = async (socket: ISocket) => {
    try{
        const container = await DockerContainer.findById(socket.user.container);
        if(!container) return;
        const containerService = new DockerContainerService(container);
        await containerService.startSocketShell(socket);
    }catch (error){
        logger.error('@controllers/wsController.ts (handleCloudConsole): ' + error);
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
                    if(!error) handleDockerShell(socket);
                    else logger.error('@controllers/wsController.ts (default): ', error);
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
