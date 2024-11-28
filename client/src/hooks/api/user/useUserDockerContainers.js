import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerContainers } from '@services/docker/container/operations';
import { setState as dockerContSetState } from '@services/docker/container/slice';

const useUserDockerContainers = () => {
    const dispatch = useDispatch();
    const { dockerContainers, isLoading, error, stats, isOperationLoading } = useSelector((state) => state.dockerContainer);
    
    useEffect(() => {
        dispatch(getMyDockerContainers());
        return () => {
            dispatch(dockerContSetState({ path: 'containers', value: [] }));
        }
    }, []);

    return { dockerContainers, isLoading, error, stats, isOperationLoading };
};

export default useUserDockerContainers;