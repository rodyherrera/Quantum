import DockerNetwork from '@models/docker/network';
import HandlerFactory from '@controllers/common/handlerFactory';

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
    pre: [(req, query) => {
        query.user = req.user;
        return query;
    }]
});