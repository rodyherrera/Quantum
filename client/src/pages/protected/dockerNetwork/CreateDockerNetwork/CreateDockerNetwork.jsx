import React from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import useUserDockerContainers from '@hooks/useUserDockerContainers';
import { createDockerNetwork } from '@services/dockerNetwork/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './CreateDockerNetwork.css';

const CreateDockerNetwork = () => {
    const { error, isOperationLoading } = useSelector((state) => state.dockerContainer);
    const { dockerContainers } = useUserDockerContainers();
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
                    type: 'select',
                    name: 'driver',
                    options: [
                        ['bridge', 'bridge'], 
                        ['host', 'host'], 
                        ['overlay', 'overlay'], 
                        ['none', 'none']
                    ],
                    placeholder: 'Select a network driver',
                    helperText: 'Choose the type of driver for the network. Options: bridge, host, overlay, or none. Default is "bridge".'
                },
                {
                    type: 'select',
                    name: 'containers',
                    options: dockerContainers.map(({ name, _id }) => [_id, name]),
                    placeholder: 'Select containers to connect',
                    helperText: 'Select the containers you want to connect to this network. You can choose one or more containers.'
                }
            ]}
        />
    );
};

export default CreateDockerNetwork;