import React from 'react';
import { DockerNetworkHeader, DockerNetworkBody, DockerNetworkFooter } from '@components/molecules/Docker/DockerNetwork';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './DockerNetwork.css';
import { deleteDockerNetwork } from '@services/docker/network/operations';
import { useDispatch, useSelector } from 'react-redux';

const DockerNetwork = ({ network }) => {
    const dispatch = useDispatch();
    const { dockerNetworks } = useSelector((state) => state.dockerNetwork);

    const handleDockerNetworksDelete = () => {
        dispatch(deleteDockerNetwork(network._id, dockerNetworks));
    };

    return (
        <DashboardCard>
            <DockerNetworkHeader network={network} />
            <DockerNetworkBody network={network} />
            <DockerNetworkFooter onDelete={handleDockerNetworksDelete} network={network} />
        </DashboardCard>
    );
};

export default DockerNetwork;