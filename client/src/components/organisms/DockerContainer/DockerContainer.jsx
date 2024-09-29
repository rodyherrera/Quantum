import React from 'react';
import {
    DockerContainerHeader,
    DockerContainerBody,
    DockerContainerFooter
} from '@components/molecules/DockerContainer';
import './DockerContainer.css';

const DockerContainer = ({ container }) => {

    return (
        <div className='Docker-Container'>
            <DockerContainerHeader container={container} />
            <DockerContainerBody container={container} />
            <DockerContainerFooter container={container} />
        </div>
    );
};

export default DockerContainer;