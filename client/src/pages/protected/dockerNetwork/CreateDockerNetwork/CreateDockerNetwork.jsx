import React from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import useUserDockerContainers from '@hooks/useUserDockerContainers';
import { createDockerNetwork } from '@services/dockerNetwork/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateDockerNetworkImage from '@images/CreateDockerNetwork.jpeg';
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
            submitButtonTitle='Create Network'
            variant='Form-Image'
            formImage={CreateDockerNetworkImage}
            breadcrumbsItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Networks', to: '/dashboard/' },
                { title: 'Create Network', to: '/docker-network/create/' }
            ]}
            handleFormSubmit={handleFormSubmit}
            headerTitle='Create a Docker Network'
            headerSubtitle='Establish a network that enables communication between your Docker containers.'
            RightContainerComponent={() => {}}
            formInputs={[
                {
                    type: 'text',
                    name: 'name',
                    placeholder: 'Enter a network name (e.g., my_custom_network)',
                    helperText: 'Provide a unique name for your Docker network. This name will be used to reference the network in Docker commands and configurations.'
                },
                {
                    type: 'select',
                    name: 'containers',
                    options: dockerContainers.map(({ name, _id }) => [_id, name]),
                    placeholder: 'Choose containers to connect',
                    helperText: 'Select the containers you wish to connect to this network. You can choose one or multiple containers from the list.'
                }
            ]}
        />
    );
};

export default CreateDockerNetwork;