import React from 'react';
import { humanFileSize } from '@utilities/common/fileUtils';
import { DashboardCardHeader } from '@components/atoms/DashboardCard';
import './DockerImageHeader.css';

const DockerImageHeader = ({ image }) => {
    const options = [
        'Image: ' + image.name + ':' + image.tag,
        humanFileSize(image.size),
        'Containers: ' + image.containers.length 
    ]

    return <DashboardCardHeader options={options} />
};

export default DockerImageHeader;