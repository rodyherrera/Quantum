import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerNetworks } from '@services/docker/network/operations';
import { setState as dockerNetSetState } from '@services/docker/network/slice';

const useUserDockerNetworks = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const { dockerNetworks, isLoading, error, stats, isOperationLoading } = useSelector((state) => state.dockerNetwork);

    useEffect(() => {
        dispatch(getMyDockerNetworks({ page }));
    }, [page]);

    useEffect(() => {
        return () => {
            dispatch(dockerNetSetState({ path: 'networks', value: [] }));
        }
    }, []);

    return { dockerNetworks, isLoading, error, stats, isOperationLoading, page, setPage };
};

export default useUserDockerNetworks;