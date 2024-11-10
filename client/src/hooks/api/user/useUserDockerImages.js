import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerImages } from '@services/docker/image/operations';
import { setState as dockerImgSetState } from '@services/docker/image/slice';

const useUserDockerImages = () => {
    const dispatch = useDispatch();
    const { dockerImages, isLoading, error, stats, isOperationLoading } = useSelector((state) => state.dockerImage);
    
    useEffect(() => {
        dispatch(getMyDockerImages());
        return () => {
            dispatch(dockerImgSetState({ path: 'images', value: [] }));
        };
    }, []);

    return { dockerImages, isLoading, error, stats, isOperationLoading };
};

export default useUserDockerImages;