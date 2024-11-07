import React from 'react';
import { useDispatch } from 'react-redux';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import { setState as dockerImageSetState } from '@services/docker/image/slice';
import useDeleteDockerImage from '@hooks/api/docker/useDeleteDockerImage';
import './DockerImageBody.css';

const DockerImageBody = ({ image }) => {
    const dispatch = useDispatch();
    const deleteDockerImage = useDeleteDockerImage(image._id);

    const selectDockerImage = () => {
        dispatch(dockerImageSetState({ path: 'selectedDockerImage', value: image }));
    };

    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deleteDockerImage },
        { title: 'Edit Container Image', to: `/docker-image/${image._id}/update`, onClick: selectDockerImage }
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