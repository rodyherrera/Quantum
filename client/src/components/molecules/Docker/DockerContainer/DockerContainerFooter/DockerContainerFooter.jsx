import React, { useEffect } from 'react';
import { IoCloudOutline } from 'react-icons/io5';
import { CiServer } from 'react-icons/ci';
import { PiDatabaseThin } from 'react-icons/pi';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { GoTerminal } from 'react-icons/go';
import { setState } from '@services/docker/container/slice';
import './DockerContainerFooter.css';

const DockerContainerFooter = ({ container }) => {
    const dispatch = useDispatch();

    const selectContainerHandler = () => {
        const { environment } = container;
        const variables = Object.entries(environment.variables);
        dispatch(setState({
            path: 'selectedDockerContainer',
            value: { ...container, environment: { variables } }
        }));
    };
    
    const options = [
        ['Terminal', GoTerminal, `/docker-container/${container._id}/shell/`, selectContainerHandler, !container?.command],
        ['Expose Port', IoCloudOutline, '/port-binding/create/', selectContainerHandler],
        ['Environment Variables', PiDatabaseThin, `/docker-container/${container._id}/environment-variables/`, selectContainerHandler],
        ['File Explorer', CiServer, `/docker-container/${container._id}/storage/`, selectContainerHandler]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerContainerFooter;