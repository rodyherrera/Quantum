import DockerNetwork from '@models/dockerNetwork';
import HandlerFactory from '@controllers/handlerFactory';

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
export const createDockerNetwork = DockerNetworkFactory.createOne();
export const updateDockerNetwork = DockerNetworkFactory.updateOne();
export const deleteDockerNetwork = DockerNetworkFactory.deleteOne();

// TODO: refactor user ownership operations in handlerFactory by verifyn user in req.user 
// and add a query or something for verify admin request or user req