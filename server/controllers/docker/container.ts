import DockerContainer from '@models/docker/container';
import RuntimeError from '@utilities/runtimeError';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';
import mongoose from 'mongoose';
import { IDockerImage } from '@typings/models/docker/image';
import { IDockerNetwork } from '@typings/models/docker/network';
import { IRequestDockerImage } from '@typings/controllers/docker/container';
import { isImageAvailable } from '@services/docker/image';
import { catchAsync, findRandomAvailablePort } from '@utilities/helpers';
import { NextFunction, Request, Response } from 'express';
import { IUser } from '@typings/models/user';

const DockerContainerFactory = new HandlerFactory({
    model: DockerContainer,
    fields: [
        'user',
        'image',
        'portBindings',
        'status',
        'networks',
        'environment',
        'name'
    ]
});

const findOrCreateImage = async (
    image: string | IRequestDockerImage, 
    userId: string, 
    next: NextFunction
): Promise<IDockerImage | null> => {
    let containerImage = null;
    if(mongoose.isValidObjectId(image)){
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
    network: string, 
    userId: string,
): Promise<IDockerNetwork | null> => {
    let containerNetwork = null;
    if(mongoose.isValidObjectId(network)){
        containerNetwork = await DockerNetwork.findById(network).select('_id');
    }
    if(!containerNetwork){
        containerNetwork = await DockerNetwork.create({ 
            user: userId,
            driver: 'bridge', 
            name: network 
        });
    }
    return containerNetwork;
};

export const getMyDockerContainers = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const containers = await DockerContainer.find({ user: user._id }).populate('network image');
    res.status(200).json({ status: 'success', data: containers });
});

// verify ownership!!!!!
export const updateDockerContainer = DockerContainerFactory.updateOne();

export const randomAvailablePort = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const port = await findRandomAvailablePort();
    if(port === -1){
        // "ManyFailedAttempts" comes from the fact that, if the function finds that 
        // a port is busy, it will try another 9 times to look for a free one. 
        // If all attempts fail (10), it will return -1.
        return next(new RuntimeError('DockerContainer::RandomAvailablePort::ManyFailedAttempts', 500));
    }
    res.status(200).json({ status: 'success', data: port });
});

export const createDockerContainer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { image, name, network } = req.body;
    if(!image || !name){
        return next(new RuntimeError('DockerContainer::CreateDocker::MissingParams', 400));
    }
    const user = req.user as IUser;
    const userId = user._id.toString();
    
    const containerImage = await findOrCreateImage(image, userId, next);
    const containerNetwork = await findOrCreateNetwork(network, userId);
    if(!containerNetwork || !containerImage){
        return next(new RuntimeError('DockerContainer::CreateDocker::ImageOrNetworkError', 500));
    }

    const container = await DockerContainer.create({ 
        name, 
        user: userId, 
        image: containerImage._id, 
        network: containerNetwork._id 
    });

    res.status(200).json({ status: 'success', data: container });
});