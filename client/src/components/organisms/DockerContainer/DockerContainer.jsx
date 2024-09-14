import React from 'react';
import './DockerContainer.css';

const DockerContainer = ({ container }) => {

    return (
        <div className='Docker-Container'>
            <h3>{container.name}</h3>
        </div>
    );
};

export default DockerContainer;