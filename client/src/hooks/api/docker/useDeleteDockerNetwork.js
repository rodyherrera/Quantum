import { useDispatch } from 'react-redux';
import { deleteDockerNetwork } from '@services/docker/network/operations';

const useDeleteDockerNetwork = (documentId) => {
    const dispatch = useDispatch();

    const deleteDockerNetworkHandler = () => {
        dispatch(deleteDockerNetwork(documentId));
    };

    return deleteDockerNetworkHandler;
};

export default useDeleteDockerNetwork;