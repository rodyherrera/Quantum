import React from 'react';
import { IoCloudOutline } from 'react-icons/io5';
import { CiServer, CiCloudOff, CiRedo, CiCloudOn } from 'react-icons/ci';
import { PiDatabaseThin } from 'react-icons/pi';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { GoTerminal } from 'react-icons/go';
import { setDockerStatus } from '@services/docker/container/operations';
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

    const containerStatusHandler = (status) => {
        dispatch(setDockerStatus(container._id, status));
    };
    
    const options = [
        ['Terminal', GoTerminal, `/docker-container/${container._id}/shell/`, selectContainerHandler, !container?.command || ['stopped', 'restarting', 'reloading'].includes(container?.status)],
        ['Expose Port', IoCloudOutline, '/port-binding/create/', selectContainerHandler, ['stopped', 'restarting', 'reloading'].includes(container?.status)],
        ['Environment', PiDatabaseThin, `/docker-container/${container._id}/environment-variables/`, selectContainerHandler],
        ['File Explorer', CiServer, `/docker-container/${container._id}/storage/`, selectContainerHandler],
        container.status === 'running' ? 
            ['Stop', CiCloudOff, null, () => containerStatusHandler('stop')] : 
            ['Start', CiCloudOn, null, () => containerStatusHandler('start')],
        ['Restart', CiRedo, null, () => containerStatusHandler('restart'), ['stopped', 'restarting', 'reloading'].includes(container?.status)]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerContainerFooter;