import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { setState as dockerNetworkSetState } from '@services/docker/network/slice';
import { setState as dockerImageSetState } from '@services/docker/image/slice';
import { setState as dockerContainerSetState } from '@services/docker/container/slice';
import useDeleteDockerContainer from '@hooks/api/docker/useDeleteDockerContainer';
import './DockerContainerBody.css';

const DockerContainerBody = ({ container }) => {
    const dispatch = useDispatch();
    const deleteDockerContainer = useDeleteDockerContainer(container._id);

    const selectContainer = () => {
        dispatch(dockerContainerSetState({ path: 'selectedDockerContainer', value: container }))
    };

    const selectDockerNetwork = () => {
        dispatch(dockerNetworkSetState({ path: 'selectedDockerNetwork', value: container.network }));
    };

    const selectDockerImage = () => {
        dispatch(dockerImageSetState({ path: 'selectedDockerImage', value: container.image }));
    };

    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deleteDockerContainer, disabled: container?.isUserContainer },
        { title: 'Edit Container', to: `/docker-container/${container._id}/update/?isUpdate=true`, onClick: selectContainer },
        { title: 'Expose Ports', to: '/port-binding/create/', onClick: selectContainer },
        { title: 'Environment Variables', to: `/docker-container/${container._id}/environment-variables/`, onClick: selectContainer },
        { title: 'File Explorer', to: `/docker-container/${container._id}/storage/`, onClick: selectContainer },
        { title: 'Container Terminal', to: `/docker-container/${container._id}/shell/`, onClick: selectContainer },
        { title: 'Edit Container Network', to: `/docker-network/${container.network}/update`, onClick: selectDockerNetwork },
        { title: 'Edit Container Image', to: `/docker-image/${container.image}/update`, onClick: selectDockerImage }
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