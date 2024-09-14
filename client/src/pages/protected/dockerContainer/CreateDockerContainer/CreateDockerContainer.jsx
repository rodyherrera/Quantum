import React from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import { createDockerContainer } from '@services/dockerContainer/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './CreateDockerContainer.css';

const CreateDockerContainer = () => {
    const { error, isOperationLoading } = useSelector((state) => state.dockerContainer);
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
                    type: 'text',
                    name: 'image',
                    placeholder: 'Container Image',
                    helperText: 'For example "alpine:latest", in case you want to create a container that runs Alpine.'
                }
            ]}
        />
    )
};

export default CreateDockerContainer;