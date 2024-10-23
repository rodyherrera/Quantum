import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import './DockerNetworkFooter.css';

const DockerNetworkFooter = ({ network, onDelete }) => {
    const dispatch = useDispatch();

    const options = [
        ['Delete', IoIosRemoveCircleOutline, null, onDelete]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerNetworkFooter;