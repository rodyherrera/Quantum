import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerNetworks } from '@services/docker/network/operations';
import { setDockerNetworks } from '@services/docker/network/slice';

const useUserDockerNetworks = () => {
    const dispatch = useDispatch();
    const { dockerNetworks, isLoading, error } = useSelector((state) => state.dockerNetwork);

    useEffect(() => {
        dispatch(getMyDockerNetworks());
        return () => {
            dispatch(setDockerNetworks([]));
        }
    }, []);

    return { dockerNetworks, isLoading, error };
};

export default useUserDockerNetworks;