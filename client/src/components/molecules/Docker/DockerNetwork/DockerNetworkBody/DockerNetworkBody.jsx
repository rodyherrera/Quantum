import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import useDeleteDockerNetwork from '@hooks/api/docker/useDeleteDockerNetwork';
import { setState } from '@services/docker/network/slice';
import { useDispatch } from 'react-redux';
import './DockerNetworkBody.css';

const DockerNetworkBody = ({ network }) => {
    const deleteDockerNetwork = useDeleteDockerNetwork(network._id);
    const dispatch = useDispatch();

    const selectDockerNetwork = () => {
        dispatch(setState({ path: 'selectedDockerNetwork', value: network }))
    };

    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deleteDockerNetwork },
        { title: 'Edit Network', to: `/docker-network/${network._id}/update/?isUpdate=true`, onClick: selectDockerNetwork }
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