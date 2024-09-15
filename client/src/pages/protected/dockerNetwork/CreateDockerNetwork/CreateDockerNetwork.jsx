import React from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import { createDockerNetwork } from '@services/dockerNetwork/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './CreateDockerNetwork.css';

const CreateDockerNetwork = () => {
    const { error, isOperationLoading } = useSelector((state) => state.dockerContainer);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleFormSubmit = (formValues) => {
        dispatch(createDockerNetwork(formValues, navigate));
    };

    return (
        <MinimalForm
            error={error}
            isLoading={isOperationLoading}
            submitButtonTitle='Create Container'
            handleFormSubmit={handleFormSubmit}
            headerTitle='Creating Docker Container'
            headerSubtitle='It will be in the blink of an eye.'
            RightContainerComponent={() => {}}
            formInputs={[
                {
                    type: 'text',
                    name: 'name',
                    placeholder: 'Network Name (e.g., my_custom_network)',
                    helperText: 'Enter a unique name for the Docker network. This name will be used to reference the network in Docker commands.'
                },
                {
                    type: 'text',
                    name: 'driver',
                    placeholder: 'Select a network driver',
                    helperText: 'Choose the type of driver for the network. Options: bridge, host, overlay, or none. Default is "bridge".'
                },
                {
                    type: 'text',
                    name: 'containers',
                    placeholder: 'Select containers to connect',
                    helperText: 'Select the containers you want to connect to this network. You can choose one or more containers.'
                }
            ]}
        />
    );
};

export default CreateDockerNetwork;