import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import useDeleteDockerNetwork from '@hooks/api/docker/useDeleteDockerNetwork';
import './DockerNetworkBody.css';

const DockerNetworkBody = ({ network }) => {
    const deleteDockerNetwork = useDeleteDockerNetwork(network._id);

    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deleteDockerNetwork },
        { title: 'Edit Network' }
    ];

    return (
        <DashboardCardBody
            name={network.name}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={network.createdAt}
            updatedAt={network.updatedAt}
        />
    );
};

export default DockerNetworkBody;