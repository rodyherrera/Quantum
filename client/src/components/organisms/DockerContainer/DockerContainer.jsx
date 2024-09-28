import React from 'react';
import DockerContainerHeader from '@components/molecules/DockerContainerHeader';
import DockerContainerBody from '@components/molecules/DockerContainerBody';
import DockerContainerFooter from '@components/molecules/DockerContainerFooter';
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