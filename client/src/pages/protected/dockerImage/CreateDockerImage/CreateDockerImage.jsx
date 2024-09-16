import React from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import { createDockerImage } from '@services/dockerImage/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './CreateDockerImage.css';

const CreateDockerImage = () => {
    const { error, isOperationLoading } = useSelector((state) => state.dockerContainer);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleFormSubmit = (formValues) => {
        dispatch(createDockerImage(formValues, navigate));
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
                    placeholder: 'Image Name (e.g., alpine)',
                    helperText: 'Enter the name of the Docker image you want to use. This could be a base image like "alpine" or a custom image.'
                },
                {
                    type: 'text',
                    name: 'tag',
                    value: 'latest',
                    placeholder: 'Tag (e.g., latest)',
                    helperText: 'Specify the image tag. If unsure, use "latest" to pull the most recent version of the image.'
                }
            ]}
        />
    );
};

export default CreateDockerImage;