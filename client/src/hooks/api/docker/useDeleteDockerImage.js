import { useDispatch, useSelector } from 'react-redux';
import { deleteDockerImage } from '@services/docker/image/operations';

const useDeleteDockerImage = (imageId) => {
    const dispatch = useDispatch();
    const { dockerImages } = useSelector((state) => state.dockerImage);

    const deleteDockerImageHandler = () => {
        dispatch(deleteDockerImage(imageId, dockerImages));
    };

    return deleteDockerImageHandler;
};

export default useDeleteDockerImage;