import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerImages } from '@services/dockerImage/operations';
import { setDockerImages } from '@services/dockerImage/slice';

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