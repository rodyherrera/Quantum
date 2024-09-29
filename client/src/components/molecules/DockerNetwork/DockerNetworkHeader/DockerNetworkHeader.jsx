import React from 'react';
import { DashboardCardHeader } from '@components/atoms/DashboardCard';
import './DockerNetworkHeader.css';

const DockerNetworkHeader = ({ network }) => {
    const options = [
        'Subnet: ' + network.subnet,
        'Driver: ' + network.driver,
        'Containers: ' + network.containers.length
    ];

    return <DashboardCardHeader options={options} />
};

export default DockerNetworkHeader;