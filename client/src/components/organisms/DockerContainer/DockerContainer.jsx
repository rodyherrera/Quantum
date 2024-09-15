import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DockerContainer.css';

const DockerContainer = ({ container }) => {
    const navigate = useNavigate();

    return (
        <div className='Docker-Container' onClick={() => navigate(`/docker-container/${container._id}/shell/`)}>
            <h3>{container.name}</h3>
        </div>
    );
};

export default DockerContainer;