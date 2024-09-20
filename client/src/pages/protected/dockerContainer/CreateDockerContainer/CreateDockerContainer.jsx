import React, { useEffect } from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import { createDockerContainer } from '@services/dockerContainer/operations';
import { getMyDockerNetworks } from '@services/dockerNetwork/operations';
import { getMyDockerImages } from '@services/dockerImage/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { humanFileSize } from '@utilities/runtime';
import './CreateDockerContainer.css';

const CreateDockerContainer = () => {
    const { error, isOperationLoading } = useSelector((state) => state.dockerContainer);
    const { dockerNetworks } = useSelector((state) => state.dockerNetwork);
    const { dockerImages } = useSelector((state) => state.dockerImage);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getMyDockerNetworks());
        dispatch(getMyDockerImages());
    }, []);

    const handleFormSubmit = (formValues) => {
        dispatch(createDockerContainer(formValues, navigate));
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
                    placeholder: 'My Docker Container',
                    helperText: 'Enter a name for your container. The one you want.'
                },
                {
                    type: 'select',
                    name: 'image',
                    options: dockerImages.map(({ name, size, tag, _id }) => [_id, `${name}:${tag} ${humanFileSize(size)}`]),
                    placeholder: 'Container Image',
                    helperText: 'For example "alpine:latest", in case you want to create a container that runs Alpine.'
                },
                {
                    type: 'select',
                    name: 'network',
                    options: dockerNetworks.map(({ name, driver, subnet, _id }) => [_id, `${name} (${subnet}) (${driver})`]),
                    placeholder: 'Container Network',
                    helperText: 'Container Network'
                }
            ]}
        />
    );
};

export default CreateDockerContainer;