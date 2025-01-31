import React from 'react';
import RelatedItems from '@components/organisms/RelatedItems';
import { CiServer } from 'react-icons/ci';
import { useSelector } from 'react-redux';
import { GoTerminal } from 'react-icons/go';
import { IoCloudOutline } from 'react-icons/io5';
import { MdDataObject } from 'react-icons/md';

const DockerContainerRelatedSections = () => {
    const { selectedDockerContainer } = useSelector((state) => state.dockerContainer);

    const items = [
        {
            title: 'Terminal',
            description: 'Execute commands directly through the container shell.',
            icon: GoTerminal,
            to: `/docker-container/${selectedDockerContainer._id}/shell/`
        },
        {
            title: 'Expose Port',
            description: 'Exposes local ports of the server to the outside through the public IP of the host server.',
            icon: IoCloudOutline,
            to: '/port-binding/create/'
        },
        {
            title: 'File Explorer',
            description: 'Explore and manage your files and folders directly from the browser.',
            icon: CiServer,
            to: `/docker-container/${encodeURIComponent(selectedDockerContainer._id)}/storage/`
        },
        {
            title: 'Environment Variables',
            icon: MdDataObject,
            description: "Manage your application's environment variables, such as API keys and environment-specific settings.",
            to: `/docker-container/${encodeURIComponent(selectedDockerContainer?._id)}/environment-variables/`
        }
    ];

    return <RelatedItems items={items} />
};

export default DockerContainerRelatedSections;