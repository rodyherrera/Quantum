import { useDispatch } from 'react-redux';
import { deleteDockerContainer } from '@services/docker/container/operations';

const useDeleteDockerImage = (documentId) => {
    const dispatch = useDispatch();

    const deleteDockerContainerHandler = () => {
        dispatch(deleteDockerContainer(documentId));
    };

    return deleteDockerContainerHandler;
};

export default useDeleteDockerImage;