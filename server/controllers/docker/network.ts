import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';
import { catchAsync } from '@utilities/helpers';
import { Request, Response } from 'express';
import { IUser } from '@typings/models/user';

const DockerNetworkFactory = new HandlerFactory({
    model: DockerNetwork,
    fields: [
        'name',
        'driver',
        'user',
        'containers'
    ]
});

export const getDockerNetworks = DockerNetworkFactory.getAll();
export const getDockerNetwork = DockerNetworkFactory.getOne();
export const createDockerNetwork = DockerNetworkFactory.createOne((req: Request, query: any) => {
    query.user = req.user;
    return query;
});
export const updateDockerNetwork = DockerNetworkFactory.updateOne();
export const deleteDockerNetwork = DockerNetworkFactory.deleteOne();

// TODO: refactor user ownership operations in handlerFactory by verifyn user in req.user 
// and add a query or something for verify admin request or user req
export const getMyDockersNetwork = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const networks = await DockerNetwork.find({ user: user._id });
    res.status(200).json({ status: 'success', data: networks });
});