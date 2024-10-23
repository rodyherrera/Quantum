import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import './DockerImageFooter.css';

const DockerImageFooter = ({ image }) => {
    const dispatch = useDispatch();

    const options = [
        ['Delete', IoIosRemoveCircleOutline]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerImageFooter;