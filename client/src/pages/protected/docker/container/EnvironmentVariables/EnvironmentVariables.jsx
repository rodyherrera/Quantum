import React, { useEffect, useState } from 'react';
import EnvironmentVariables from '@components/organisms/EnvironmentVariables';
import * as dockerContainerSlice from '@services/docker/container/slice';
import { useSelector, useDispatch } from 'react-redux';
import { updateDockerContainer } from '@services/docker/container/operations';
import { useNavigate } from 'react-router-dom';
import './EnvironmentVariables.css';

const ContainerEnvironVariables = () =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { selectedDockerContainer } = useSelector((state) => state.dockerContainer);

    const handleEnvironmentUpdate = (updatedEnvironment) => {
        const body = { environment: updatedEnvironment };
        dispatch(updateDockerContainer(selectedDockerContainer._id, body, navigate));
    };

    const handleCreateNew = (variables, environment) => {
        dispatch(dockerContainerSlice.setState({
            path: 'selectedDockerContainer',
            value: { ...selectedDockerContainer, environment: { variables } }
        }));
    };

    const onUpdateVariable = (_, variables) => {
        dispatch(dockerContainerSlice.setState({
            path: 'selectedDockerContainer',
            value: { ...selectedDockerContainer, environment: { variables } }
        }));
    };

    const unwrapVariables = () => {
        setIsLoading(true);
        const { environment } = selectedDockerContainer;
        const variables = Object.entries(environment.variables);
        dispatch(dockerContainerSlice.setState({
            path: 'selectedDockerContainer',
            value: { ...selectedDockerContainer, environment: { variables } }
        }));
        setIsLoading(false);
    };

    useEffect(() => {
        unwrapVariables();
    }, []);

    return (!isLoading) && <EnvironmentVariables
        title='Environment Variables'
        description='Manage environment variables for your containers simply and securely. Customize settings, manage credentials, and adjust parameters based on your environment without modifying images. Optimize your deployments with ease!'
        environment={selectedDockerContainer?.environment || {}}
        handleSave={handleEnvironmentUpdate}
        onUpdateVariable={onUpdateVariable}
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