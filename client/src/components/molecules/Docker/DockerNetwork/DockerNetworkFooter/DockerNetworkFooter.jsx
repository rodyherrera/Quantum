import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import './DockerNetworkFooter.css';

const DockerNetworkFooter = ({ network }) => {
    const dispatch = useDispatch();

    const options = [
        ['Delete', IoIosRemoveCircleOutline]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerNetworkFooter;