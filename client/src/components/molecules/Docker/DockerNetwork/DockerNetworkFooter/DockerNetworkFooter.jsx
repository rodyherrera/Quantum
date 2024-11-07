import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { setState as dockerNetworkSetState } from '@services/docker/network/slice';
import { LiaEditSolid } from 'react-icons/lia';
import useDeleteDockerNetwork from '@hooks/api/docker/useDeleteDockerNetwork';
import './DockerNetworkFooter.css';

const DockerNetworkFooter = ({ network }) => {
    const dispatch = useDispatch();
    const deleteDockerNetwork = useDeleteDockerNetwork(network._id);

    const selectDockerNetwork = () => {
        dispatch(dockerNetworkSetState({ path: 'selectedDockerNetwork', value: network }));
    };

    const options = [
        ['Delete', IoIosRemoveCircleOutline, null, deleteDockerNetwork],
        ['Edit', LiaEditSolid,`/docker-network/${network._id}/update`, selectDockerNetwork]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerNetworkFooter;