import DockerContainer from '@models/docker/container';
import DockerHandler from '@services/docker/container';
import RuntimeError from '@utilities/runtimeError';
import path from 'path';
import slugify from 'slugify';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';
import { IDockerImage } from '@typings/models/docker/image';
import { IDockerNetwork } from '@typings/models/docker/network';
import { IRequestDockerImage, IRequestDockerNetwork } from '@typings/controllers/docker/container';
import { isImageAvailable } from '@services/docker/image';
import { catchAsync } from '@utilities/helpers';
import { NextFunction, Request, Response } from 'express';
import { IUser } from '@typings/models/user';

const DockerContainerFactory = new HandlerFactory({
    model: DockerContainer,
    fields: [
        'user',
        'image',
        'status',
        'ports',
        'volumeMounts',
        'networks',
        'environment',
        'name'
    ]
});

const configureContainerStorage = (userId: string, name: string, containerId: string) => {
    const userContainerPath = path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', userId);
    const containerStoragePath = path.join(userContainerPath, 'docker-containers', `${slugify(name)}-${containerId}`);
    return containerStoragePath;
};

const findOrCreateImage = async (
    image: string | IRequestDockerImage, 
    userId: string, 
    next: NextFunction
): Promise<IDockerImage | null> => {
    let containerImage = null;
    if(typeof image === 'string'){
        containerImage = await DockerImage.findById(image).select('_id');
    }
    if(!containerImage){
        const { name, tag } = image as IRequestDockerImage;
        if(!isImageAvailable(name, tag)){
            next(new RuntimeError('DockerContainer::CreateDocker::ImageNotFound', 404));
            return null;
        }
        containerImage = await DockerImage.create({ name, tag, user: userId });
    }
    return containerImage;
};

const findOrCreateNetwork = async (
    network: string | IRequestDockerNetwork, 
    userId: string, 
    next: NextFunction
): Promise<IDockerNetwork | null> => {
    let containerNetwork = null;
    if(typeof network === 'string'){
        containerNetwork = await DockerNetwork.findById(network).select('_id');
    }
    if(!containerNetwork){
        const { driver, name } = network as IRequestDockerNetwork;
        if(!driver || !name){
            next(new RuntimeError('DockerContainer::CreateDocker::MissingParams', 400));
            return null;
        }
        containerNetwork = await DockerNetwork.create({ user: userId, driver, name });
    }
    return containerNetwork;
};

export const getMyDockerContainers = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const containers = await DockerContainer.find({ user: user._id });
    res.status(200).json({ status: 'success', data: containers });
});

export const createDockerContainer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { image, name, network } = req.body;
    if(!image || !name){
        return next(new RuntimeError('DockerContainer::CreateDocker::MissingParams', 400));
    }
    const user = req.user as IUser;
    const userId = user._id.toString();
    
    const containerImage = await findOrCreateImage(image, userId, next);
    const containerNetwork = await findOrCreateNetwork(network, userId, next);

    const container = await DockerContainer.create({ 
        name, user: userId, image: containerImage, network: containerNetwork });
    const containerId = container._id.toString();
        
    const containerStoragePath = configureContainerStorage(userId, name, containerId);
    const dockerHandler = new DockerHandler({
        imageName: image.name,
        imageTag: image.tag,
        storagePath: containerStoragePath,
        dockerName: containerId
    });

    await DockerContainer.updateOne({ _id: containerId }, { storagePath: containerStoragePath });
    await dockerHandler.createAndStartContainer();

    res.status(200).json({ status: 'success', data: dockerHandler });
});