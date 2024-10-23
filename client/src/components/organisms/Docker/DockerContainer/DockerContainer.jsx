import React from 'react';
import {
    DockerContainerHeader,
    DockerContainerBody,
    DockerContainerFooter,
} from '@components/molecules/Docker/DockerContainer';
import { DashboardCard } from '@components/atoms/DashboardCard';
import { deleteDockerContainer } from '@services/docker/container/operations';
import { useDispatch, useSelector } from 'react-redux';
import './DockerContainer.css';

const DockerContainer = ({ container }) => {
    const dispatch = useDispatch();
    const { dockerContainers } = useSelector((state) => state.dockerContainer);

    const handleDockerDelete = () => {
        dispatch(deleteDockerContainer(container._id, dockerContainers));
    };

    return (
        <DashboardCard>
            <DockerContainerHeader container={container} />
            <DockerContainerBody onDelete={handleDockerDelete} container={container} />
            <DockerContainerFooter container={container} />
        </DashboardCard>
    );
};

export default DockerContainer;