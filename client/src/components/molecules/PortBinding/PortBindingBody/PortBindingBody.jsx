import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { setState as dockerNetworkSetState } from '@services/docker/network/slice';
import { setState as dockerImageSetState } from '@services/docker/image/slice';
import { setState as dockerContainerSetState } from '@services/docker/container/slice';
import useDeletePortBinding from '@hooks/api/portBinding/useDeletePortBinding';
import './PortBindingBody.css';

const PortBindingBody = ({ portBinding }) => {
    const dispatch = useDispatch();
    const deletePortBinding = useDeletePortBinding(portBinding._id);

    const selectDockerNetwork = () => {
        dispatch(dockerNetworkSetState({ path: 'selectedDockerNetwork', value: portBinding.container.network }));
    };


    const selectContainer = () => {
        dispatch(dockerContainerSetState({ path: 'selectedDockerContainer', value: portBinding.container }))
    };

    const selectDockerImage = () => {
        dispatch(dockerImageSetState({ path: 'selectedDockerImage', value: portBinding.container.image }));
    };
 
    const ctxMenuOpts = [
        { title: 'Delete Permanently', onClick: deletePortBinding },
        { title: 'Edit Container', to: `/docker-container/${portBinding.container._id}/update`, onClick: selectContainer },
        { title: 'Expose Ports', to: `/port-binding/create/` },
        { title: 'Environment Variables', to: `/docker-container/${portBinding.container._id}/environment-variables/`, onClick: selectContainer },
        { title: 'File Explorer', to: `/docker-container/${portBinding.container._id}/storage`, onClick: selectContainer },
        { title: 'Container Terminal', to: `/docker-container/${portBinding.container._id}/shell`, onClick: selectContainer },
        { title: 'Edit Container Network', to: `/docker-network/${portBinding.container.network}/update`, onClick: selectDockerNetwork },
        { title: 'Edit Container Image', to: `/docker-image/${portBinding.container.image}/update`, onClick: selectDockerImage }
    ];

    return (
        <DashboardCardBody
            name={`${portBinding.container.ipAddress}:${portBinding.internalPort}->${portBinding.externalPort}`}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={portBinding.createdAt}
            updatedAt={portBinding.updatedAt}
        />
    );
};

export default PortBindingBody;