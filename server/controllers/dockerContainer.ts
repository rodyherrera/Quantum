import DockerContainer from '@models/dockerContainer';
import DockerHandler from '@services/dockerHandler';
import RuntimeError from '@utilities/runtimeError';
import path from 'path';
import HandlerFactory from '@controllers/handlerFactory';
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

export const createDockerContainer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { image, name } = req.body;
    if(!image || !name){
        return next(new RuntimeError('DockerContainer::CreateDocker::MissingParams', 400));
    }
    // TODO: use handlerFactory for refactor this.
    if(!DockerHandler.checkImageExists(image)){
        return next(new RuntimeError('DockerContainer::CreateDocker::ImageNotFound', 404));
    }
    const user = req.user as IUser;
    const dockerContainer = await DockerContainer.create({ name, image, user });
    const dockerContainerId = dockerContainer._id.toString();
    const dockerHandler = new DockerHandler({
        imageName: image,
        storagePath: path.join('/var/lib/quantum', process.env.NODE_ENV as string, 'containers', dockerContainerId),
        dockerName: dockerContainerId
    });
    await dockerHandler.createAndStartContainer();
    res.status(200).json({ status: 'success', data: dockerHandler });
});