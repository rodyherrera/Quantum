import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { setState } from '@services/docker/container/slice';
import useDeleteDockerContainer from '@hooks/api/docker/useDeleteDockerContainer';
import './DockerContainerBody.css';

const DockerContainerBody = ({ container }) => {
    const dispatch = useDispatch();
    const deleteDockerContainer = useDeleteDockerContainer(container._id);

    const selectContainer = () => {
        dispatch(setState({ path: 'selectedDockerContainer', value: container }))
    };

    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deleteDockerContainer },
        { title: 'Edit Container', to: `/docker-container/${container._id}/update/?isUpdate=true`, onClick: selectContainer },
        { title: 'Expose Ports', to: '/port-binding/create/', onClick: selectContainer },
        { title: 'Environment Variables', to: `/docker-container/${container._id}/environment-variables/`, onClick: selectContainer },
        { title: 'File Explorer', to: `/docker-container/${container._id}/storage/`, onClick: selectContainer },
        { title: 'Container Terminal', to: `/docker-container/${container._id}/shell/`, onClick: selectContainer },
        { title: 'Edit Container Network' },
        { title: 'Edit Container Image' }
    ];

    return (
        <DashboardCardBody
            name={container?.isUserContainer ? 'Main Docker Container' : container.name}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={container.createdAt}
            updatedAt={container.updatedAt}
        />
    );
};

export default DockerContainerBody;