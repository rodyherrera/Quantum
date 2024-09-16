import DockerImage from '@models/docker/image';
import HandlerFactory from '@controllers/common/handlerFactory';

const DockerImageFactory = new HandlerFactory({
    model: DockerImage,
    fields: [
        'name',
        'tag',
        'containers',
        'user'
    ]
});

export const getDockerImages = DockerImageFactory.getAll();
export const getDockerImage = DockerImageFactory.getOne();
export const createDockerImage = DockerImageFactory.createOne();
export const updateDockerImage = DockerImageFactory.updateOne();
export const deleteDockerImage = DockerImageFactory.deleteOne();