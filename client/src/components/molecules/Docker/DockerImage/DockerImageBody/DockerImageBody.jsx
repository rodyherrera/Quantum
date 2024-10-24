import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import useDeleteDockerImage from '@hooks/api/docker/useDeleteDockerImage';
import './DockerImageBody.css';

const DockerImageBody = ({ image }) => {
    const deleteDockerImage = useDeleteDockerImage(image._id);

    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deleteDockerImage },
        { title: 'Edit Network' }
    ];

    return (
        <DashboardCardBody
            name={image.name}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={image.createdAt}
            updatedAt={image.updatedAt}
        />
    );
};

export default DockerImageBody;