import React from 'react';
import { IoCloudOutline } from 'react-icons/io5';
import { CiServer } from 'react-icons/ci';
import { PiDatabaseThin } from 'react-icons/pi';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import './DockerContainerFooter.css';

const DockerContainerFooter = ({ container }) => {
    const options = [
        ['Expose Port', IoCloudOutline],
        ['Environment Variables', PiDatabaseThin],
        ['File Explorer', CiServer]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerContainerFooter;