import { useDispatch } from 'react-redux';
import { deleteDockerImage } from '@services/docker/image/operations';

const useDeleteDockerImage = (documentId) => {
    const dispatch = useDispatch();

    const deleteDockerImageHandler = () => {
        dispatch(deleteDockerImage(documentId));
    };

    return deleteDockerImageHandler;
};

export default useDeleteDockerImage;