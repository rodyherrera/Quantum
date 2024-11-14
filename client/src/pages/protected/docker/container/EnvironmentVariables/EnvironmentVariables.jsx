import React, { useCallback, useMemo } from 'react';
import EnvironmentVariables from '@components/organisms/EnvironmentVariables';
import * as dockerContainerSlice from '@services/docker/container/slice';
import { useSelector, useDispatch } from 'react-redux';
import { updateDockerContainer } from '@services/docker/container/operations';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@hooks/common';
import './EnvironmentVariables.css';

const ContainerEnvironVariables = () =>{
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedDockerContainer, isOperationLoading } = useSelector((state) => state.dockerContainer);
    useDocumentTitle('Container Environment');

    const environUpdate = useCallback((environment) => {
        const body = { environment };
        dispatch(updateDockerContainer(selectedDockerContainer._id, body, navigate));
    }, [dispatch, selectedDockerContainer, navigate]);

    const updateHandler = useCallback((variables) => {
        const updatedContainer = {
            ...selectedDockerContainer,
            environment: { variables },
        };

        dispatch(dockerContainerSlice.setState({
            path: 'selectedDockerContainer',
            value: updatedContainer
        }));
    }, [dispatch, selectedDockerContainer]);

    const breadcrumbs = useMemo(() => {
        return [
            { title: 'Home', to: '/' },
            { title: 'Dashboard', to: '/dashboard/' },
            { title: 'Docker Containers', to: '/dashboard/' },
            { title: 'Container Environment', to: `/docker-container/${selectedDockerContainer._id}/environment-variables/` }
        ];
    }, [selectedDockerContainer._id]);

    return <EnvironmentVariables
        title='Container Environment'
        description='Set your Docker container variables. You can add new ones and edit existing ones whenever you want.'
        environment={selectedDockerContainer.environment}
        isOperationLoading={isOperationLoading}
        handleSave={environUpdate}
        updateHandler={updateHandler}
        breadcrumbs={breadcrumbs}
    />
};

export default ContainerEnvironVariables;