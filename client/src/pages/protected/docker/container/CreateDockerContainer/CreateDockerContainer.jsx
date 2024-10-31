import React, { useEffect } from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import { createDockerContainer, updateDockerContainer } from '@services/docker/container/operations';
import { getMyDockerNetworks } from '@services/docker/network/operations';
import { getMyDockerImages } from '@services/docker/image/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { humanFileSize } from '@utilities/common/fileUtils';
import CreateDockerContainerImage from '@images/CreateDockerContainer.jpeg';
import './CreateDockerContainer.css';

const CreateDockerContainer = () => {
    const { error, isOperationLoading, selectedDockerContainer } = useSelector((state) => state.dockerContainer);
    const { dockerNetworks } = useSelector((state) => state.dockerNetwork);
    const { dockerImages } = useSelector((state) => state.dockerImage);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log(selectedDockerContainer);
        dispatch(getMyDockerNetworks());
        dispatch(getMyDockerImages());
    }, []);

    const handleFormSubmit = (formValues) => {
        if(formValues?.image?.search?.(':') !== -1){
            // e.g { image: 'alpine:latest' }
            const [ name, tag ] = formValues.image.split(':');
            formValues.image = { name, tag};
        }
        if(searchParams.get('isUpdate')){
            dispatch(updateDockerContainer(selectedDockerContainer._id, formValues, navigate));
            return;
        }
        dispatch(createDockerContainer(formValues, navigate));
    };

    return (
        <MinimalForm
            error={error}
            overlayLoading={true}
            overlayLoadingMessage='Getting image and creating volume, wait a few seconds...'
            isLoading={isOperationLoading}
            variant='Form-Image'
            formImage={CreateDockerContainerImage}
            breadcrumbsItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Containers', to: '/dashboard/' },
                { title: 'Create Container', to: '/docker-container/create/' }
            ]}
            submitButtonTitle='Create Container'
            handleFormSubmit={handleFormSubmit}
            headerTitle='Creating a new Docker Container'
            headerSubtitle='You are just one step away from creating your instance to start interacting with it.'
            formInputs={[
                {
                    type: 'text',
                    name: 'name',
                    value: selectedDockerContainer.name || '',
                    placeholder: 'e.g., my-docker-container',
                    helperText: 'Enter a unique name for your Docker container. This name will be used to identify your container.'
                },
                {
                    type: 'select',
                    name: 'image',
                    value: selectedDockerContainer?.image?._id,
                    options: dockerImages.map(({ name, size, tag, _id }) => [_id, `${name}:${tag} ${humanFileSize(size)}`]),
                    placeholder: 'Select or create a new container image e.g., "alpine:latest"',
                    helperText: 'Select an existing Docker image or enter a new one, e.g., "alpine:latest" to use the latest version of Alpine.'
                },
                {
                    type: 'select',
                    name: 'network',
                    value: selectedDockerContainer?.network?._id,
                    options: dockerNetworks.map(({ name, driver, subnet, _id }) => [_id, `${name} (${subnet}) (${driver})`]),
                    placeholder: 'Select or create a new network eg., "my-custom-network"',
                    helperText: 'Select an existing Docker network or enter a new one, e.g., "my-custom-network" to create a new network.'
                },
                {
                    type: 'text',
                    name: 'command',
                    value: selectedDockerContainer.command || '',
                    placeholder: 'e.g., /bin/bash, ollama run llama3, ...',
                    default: '/bin/sh',
                    helperText: 'Specify the command that you want to execute inside your Docker container. This will define what process runs when the container starts.'
                }
            ]}
        />
    );
};

export default CreateDockerContainer;