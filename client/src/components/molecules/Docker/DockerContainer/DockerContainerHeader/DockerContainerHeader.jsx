import React, { useEffect } from 'react';
import { humanFileSize } from '@utilities/common/fileUtils';
import { DashboardCardHeader } from '@components/atoms/DashboardCard';
import './DockerContainerHeader.css';

const DockerContainerHeader = ({ container }) => {
    useEffect(() => {
        console.log(container.name, container)
    }, []);
    const options = [
        container.ipAddress ? `IPv4: ${container.ipAddress}` : 'Unallocated Subnet IP',
        `${container.image.name}:${container.image.tag} ${humanFileSize(container.image.size)}`,
        `Status: ${container.status}`,
        `ID: ${container._id}`,
    ];

    return <DashboardCardHeader options={options} />
};

export default DockerContainerHeader;