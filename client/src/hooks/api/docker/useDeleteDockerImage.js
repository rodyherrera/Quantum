import { useDispatch, useSelector } from 'react-redux';
import { deleteDockerImage } from '@services/docker/image/operations';

const useDeleteDockerImage = (documentId) => {
    const dispatch = useDispatch();
    const { dockerImages } = useSelector((state) => state.dockerImage);

    const deleteDockerImageHandler = () => {
        dispatch(deleteDockerImage(documentId, dockerImages));
    };

    return deleteDockerImageHandler;
};

export default useDeleteDockerImage;