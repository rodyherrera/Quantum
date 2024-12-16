import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';
import { IRequest } from '@typings/controllers/common';

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
export const updateDockerNetwork = DockerNetworkFactory.updateOne();
export const deleteDockerNetwork = DockerNetworkFactory.deleteOne();
export const createDockerNetwork = DockerNetworkFactory.createOne();

export const getMyDockersNetwork = DockerNetworkFactory.getAll({
    middlewares: {
        pre: [(req: IRequest, query: any) => {
            query.user = req.user;
            return query;
        }]
    }
});