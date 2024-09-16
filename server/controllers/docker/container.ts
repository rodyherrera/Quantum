import DockerContainer from '@models/docker/container';
import DockerHandler from '@services/docker/container';
import RuntimeError from '@utilities/runtimeError';
import path from 'path';
import slugify from 'slugify';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';
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

export const getMyDockerContainers = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const containers = await DockerContainer.find({ user: user._id });
    res.status(200).json({ status: 'success', data: containers });
});

// TODO: use handlerFactory for refactor this.
export const createDockerContainer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { image, name, network } = req.body;
    if(!image || !name){
        return next(new RuntimeError('DockerContainer::CreateDocker::MissingParams', 400));
    }
    
    const user = req.user as IUser;
    const userId = user._id.toString();

    // The image can be an ID of an existing one or in { name, tag } format
    let containerImage = null;
    if(typeof image === 'string'){
        containerImage = await DockerImage.findById(image).select('_id');
    }
    if(!containerImage){
        const { name, tag } = image;
        const isAvailable = isImageAvailable(name, tag);
        if(!isAvailable){
            return next(new RuntimeError('DockerContainer::CreateDocker::ImageNotFound', 404));
        }
        containerImage = await DockerImage.create({ name, tag, user: userId });
    }
    // If it does not exist, create a new network.
    let containerNetwork = null;
    if(typeof containerNetwork === 'string'){
        containerNetwork = await DockerNetwork.findById(network).select('_id');
    }
    if(!containerNetwork){
        const { driver, name } = network;
        if(!driver || !name){
            return next(new RuntimeError('DockerContainer::CreateDocker::MissingParams', 400));
        }
        containerNetwork = await DockerNetwork.create({ user: userId, driver, name });
    }
    const container = await DockerContainer.create({ name, user: userId, image: containerImage, network: containerNetwork });
    const containerId = container._id.toString();
    
    // NOTE: check @services/userContainer.ts 
    const userContainerPath = path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', userId.toString());
    const containerStoragePath = path.join(userContainerPath, 'docker-containers', slugify(name) + '-' + containerId);
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