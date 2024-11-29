import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerContainers } from '@services/docker/container/operations';
import { setState as dockerContSetState } from '@services/docker/container/slice';

const useUserDockerContainers = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const { dockerContainers, isLoading, error, stats, isOperationLoading } = useSelector((state) => state.dockerContainer);

    useEffect(() => {
        dispatch(getMyDockerContainers({ page }));
    }, [page]);

    useEffect(() => {
        return () => {
            dispatch(dockerContSetState({ path: 'containers', value: [] }));
        }
    }, []);

    return { dockerContainers, isLoading, error, stats, isOperationLoading, page, setPage };
};

export default useUserDockerContainers;