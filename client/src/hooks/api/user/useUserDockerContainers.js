import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerContainers } from '@services/docker/container/operations';
import { setDockerContainers } from '@services/docker/container/slice';

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