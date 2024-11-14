import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerContainers } from '@services/docker/container/operations';
import { setState as dockerContSetState } from '@services/docker/container/slice';

const useUserDockerContainers = () => {
    const dispatch = useDispatch();
    const { dockerContainers, isLoading, error, containerStats, isOperationLoading } = useSelector((state) => state.dockerContainer);
    
    useEffect(() => {
        dispatch(getMyDockerContainers());
        return () => {
            dispatch(dockerContSetState({ path: 'containers', value: [] }));
        }
    }, []);

    return { dockerContainers, isLoading, error, containerStats, isOperationLoading };
};

export default useUserDockerContainers;