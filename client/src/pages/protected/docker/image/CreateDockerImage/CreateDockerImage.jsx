import React from 'react';
import MinimalForm from '@components/organisms/MinimalForm';
import { createDockerImage } from '@services/docker/image/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateDockerImageImage from '@images/CreateDockerImage.jpeg';
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
            variant='Form-Image'
            formImage={CreateDockerImageImage}
            breadcrumbsItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Images', to: '/dashboard/' },
                { title: 'Create Image', to: '/docker-image/create/' }
            ]}
            submitButtonTitle='Create Image'
            handleFormSubmit={handleFormSubmit}
            headerTitle='Create a Docker Image'
            headerSubtitle='Select the desired Docker Hub image. Remember to specify the image tag. We do the rest for you. You can then use this image in your containers as many times as you like.'
            RightContainerComponent={() => {}}
            formInputs={[
                {
                    type: 'text',
                    name: 'name',
                    placeholder: 'Image Name (e.g., alpine)',
                    helperText: 'The name of the image available on Docker Hub that you want to add. For example "mongo", "ubuntu", "alpine", "kalilinux/kali-rolling" etc.',
                    required: true
                },
                {
                    type: 'text',
                    name: 'tag',
                    required: true,
                    placeholder: 'Tag (e.g., latest)',
                    helperText: 'Specify the image tag. If unsure, use "latest" to pull the most recent version. If left blank, the default tag will be used.',
                }
            ]}
        />
    );
};

export default CreateDockerImage;