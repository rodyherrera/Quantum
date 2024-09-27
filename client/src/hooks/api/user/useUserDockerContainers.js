import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerContainers } from '@services/dockerContainer/operations';
import { setDockerContainers } from '@services/dockerContainer/slice';

const useUserDockerContainers = () => {
    const dispatch = useDispatch();
    const { dockerContainers, isLoading, error } = useSelector((state) => state.dockerContainer);
    
    useEffect(() => {
        dispatch(getMyDockerContainers());
        return () => {
            dispatch(setDockerContainers([]));
        }
    }, []);

    return { dockerContainers, isLoading, error };
};

export default useUserDockerContainers;