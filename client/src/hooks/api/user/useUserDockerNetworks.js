import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerNetworks } from '@services/docker/network/operations';
import { setState as dockerNetSetState } from '@services/docker/network/slice';

const useUserDockerNetworks = () => {
    const dispatch = useDispatch();
    const { dockerNetworks, isLoading, error, stats } = useSelector((state) => state.dockerNetwork);

    useEffect(() => {
        dispatch(getMyDockerNetworks());
        return () => {
            dispatch(dockerNetSetState({ path: 'networks', value: [] }));
        }
    }, []);

    return { dockerNetworks, isLoading, error, stats };
};

export default useUserDockerNetworks;