import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerNetworks } from '@services/dockerNetwork/operations';
import { setDockerNetworks } from '@services/dockerNetwork/slice';

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