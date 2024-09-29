import React from 'react';
import { humanFileSize } from '@utilities/common/fileUtils';
import './DockerContainerHeader.css';

const DockerContainerHeader = ({ container }) => {
    const options = [
        container.ipAddress ? `Subnet: ${container.ipAddress}` : 'Unallocated Subnet IP',
        `${container.image.name}:${container.image.tag} ${humanFileSize(container.image.size)}`,
        `Status: ${container.status}`
    ]

    return (
        <div className='Docker-Container-Header'>
            {options.map((item, index) => (
                <p className='Docker-Container-Header-Item' key={index}>{item}</p>
            ))}
        </div>
    )
};

export default DockerContainerHeader;