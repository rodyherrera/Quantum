import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerImages } from '@services/docker/image/operations';
import { setDockerImages } from '@services/docker/image/slice';

const useUserDockerImages = () => {
    const dispatch = useDispatch();
    const { dockerImages, isLoading, error } = useSelector((state) => state.dockerImage);
    
    useEffect(() => {
        dispatch(getMyDockerImages());
        return () => {
            dispatch(setDockerImages([]));
        };
    }, []);

    return { dockerImages, isLoading, error };
};

export default useUserDockerImages;