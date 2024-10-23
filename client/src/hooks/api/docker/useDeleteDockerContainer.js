import { useDispatch, useSelector } from 'react-redux';
import { deleteDockerContainer } from '@services/docker/container/operations';

const useDeleteDockerImage = (documentId) => {
    const dispatch = useDispatch();
    const { dockerContainers } = useSelector((state) => state.dockerContainer);

    const deleteDockerContainerHandler = () => {
        dispatch(deleteDockerContainer(documentId, dockerContainers));
    };

    return deleteDockerContainerHandler;
};

export default useDeleteDockerImage;