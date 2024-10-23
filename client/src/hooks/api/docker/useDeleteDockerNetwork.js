import { useDispatch, useSelector } from 'react-redux';
import { deleteDockerNetwork } from '@services/docker/network/operations';

const useDeleteDockerNetwork = (documentId) => {
    const dispatch = useDispatch();
    const { dockerNetworks } = useSelector((state) => state.dockerNetwork);

    const deleteDockerNetworkHandler = () => {
        dispatch(deleteDockerNetwork(documentId, dockerNetworks));
    };

    return deleteDockerNetworkHandler;
};

export default useDeleteDockerNetwork;