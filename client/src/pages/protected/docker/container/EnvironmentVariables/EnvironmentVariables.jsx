import React from 'react';
import EnvironmentVariables from '@components/organisms/EnvironmentVariables';
import * as dockerContainerSlice from '@services/docker/container/slice';
import { useSelector, useDispatch } from 'react-redux';
import { updateDockerContainer } from '@services/docker/container/operations';
import { useNavigate } from 'react-router-dom';
import './EnvironmentVariables.css';

const ContainerEnvironVariables = () =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedDockerContainer } = useSelector((state) => state.dockerContainer);

    const handleEnvironmentUpdate = (updatedEnvironment) => {
        const body = { environment: updatedEnvironment };
        dispatch(updateDockerContainer(selectedDockerContainer._id, body, navigate));
    };

    const handleCreateNew = (variables, environment) => {
        dispatch(dockerContainerSlice.setState({
            path: 'environment',
            value: { ...environment, variables }
        }));
    };

    return <EnvironmentVariables
        title='Environment Variables'
        description='Manage environment variables for your containers simply and securely. Customize settings, manage credentials, and adjust parameters based on your environment without modifying images. Optimize your deployments with ease!'
        environment={selectedDockerContainer?.environment || {}}
        handleSave={handleEnvironmentUpdate}
        handleCreateNew={handleCreateNew}
        breadcrumbs={[
            { title: 'Home', to: '/' },
            { title: 'Dashboard', to: '/dashboard/' },
            { title: 'Docker Containers', to: '/dashboard/' },
            { title: 'Environment Variables', to: `/docker-container/${selectedDockerContainer._id}/environment-variables/` }
        ]}
    />
};

export default ContainerEnvironVariables;