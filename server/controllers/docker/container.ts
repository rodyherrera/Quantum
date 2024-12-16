import DockerContainer from '@models/docker/container';
import RuntimeError from '@utilities/runtimeError';
import DockerImage from '@models/docker/image';
import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';
import DockerContainerService from '@services/docker/container';
import mongoose from 'mongoose';
import { IDockerImage } from '@typings/models/docker/image';
import { IDockerNetwork } from '@typings/models/docker/network';
import { IRequestDockerImage } from '@typings/controllers/docker/container';
import { isImageAvailable } from '@services/docker/image';
import { catchAsync, findRandomAvailablePort } from '@utilities/helpers';
import { NextFunction, Request, Response } from 'express';
import { IUser } from '@typings/models/user';
import { parseConfigAndDeploy } from '@services/oneClickDeploy';
import sendEmail from '@services/sendEmail';

const DockerContainerFactory = new HandlerFactory({
    model: DockerContainer,
    fields: [
        'user',
        'image',
        'portBindings',
        'status',
        'command',
        'network',
        'environment',
        'isRepositoryContainer',
        'name'
    ]
});

export const deleteDockerContainer = DockerContainerFactory.deleteOne({
    middlewares: {
        pre: [async (): Promise<any> => {
            return { isUserContainer: false };
        }]
    }
});

export const getMyDockerContainers = DockerContainerFactory.getAll({
    middlewares: {
        pre: [(req: Request, query: any) => {
            query.user = req.user;
            return query;
        }]
    }
});

export const updateDockerContainer = DockerContainerFactory.updateOne();

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

export const oneClickDeploy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { config } = req.body;
    if(!config){
        return next(new RuntimeError('Docker::Container::OneClickDeploy::MissingConfig', 400));
    }
    const container = await parseConfigAndDeploy(req.user as IUser, config);
    res.status(200).json({ status: 'success', data: container });
});

export const createDockerContainer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { image, name, network, command } = req.body;
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
        command,
        image: containerImage._id,
        network: containerNetwork._id
    });

    sendEmail({
        to: user.email,
        subject: `"${container.name}" (${containerImage.name}:${containerImage.tag}) created successfully.`,
        html: `Hello ${user.username}!, you have created the container "${container.name}" correctly. Currently, it should be deploying. The image used is "${containerImage.name}:${containerImage.tag}" and the network created for the container is "${containerNetwork.name}".`
    });

    res.status(200).json({ status: 'success', data: container });
});

export const containerStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const VALID_STATUS = ['stop', 'restart', 'start'];

    if(!VALID_STATUS.includes(status)){
        return next(new RuntimeError('DockerContainer::Status::Invalid', 400));
    }

    const containerId = req.params.id;
    const container = await DockerContainer.findById(containerId);

    if(!container){
        return next(new RuntimeError('DockerContainer::Status::NotFound', 400));
    }
    
    const containerService = new DockerContainerService(container);
    const statusMap: Record<string, () => Promise<void>> = {
        async stop(){
            await containerService.stop();
            sendEmail({
                to: req.user.email,
                subject: `Container "${container.name}" shut down successfully.`,
                html: `Hi @${req.user.username}, the container has been shut down successfully.`
            });
        },
        async restart(){
            await containerService.restart();
            sendEmail({
                to: req.user.email,
                subject: `You have successfully restarted "${container.name}"`,
                html: `Hello @${req.user.username}, the container is currently restarting, the services will be redeployed and the installation, construction and execution commands will be executed.`
            });
        },
        async start(){

            sendEmail({
                to: req.user.email,
                subject: `Starting and deploying "${container.name}"`,
                html: `Hi @${req.user.username}, your container is deploying...`
            });
        }
    };
    await statusMap[status]();

    res.status(200).json({
        status: 'success',
        data: container
    });
});