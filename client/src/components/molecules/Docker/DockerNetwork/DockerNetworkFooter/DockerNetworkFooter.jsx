import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import useDeleteDockerNetwork from '@hooks/api/docker/useDeleteDockerNetwork';
import './DockerNetworkFooter.css';

const DockerNetworkFooter = ({ network, onDelete }) => {
    const dispatch = useDispatch();
    const deleteDockerNetwork = useDeleteDockerNetwork(network._id);

    const options = [
        ['Delete', IoIosRemoveCircleOutline, null, deleteDockerNetwork]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerNetworkFooter;