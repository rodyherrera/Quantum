import React from 'react';
import { IoCloudOutline } from 'react-icons/io5';
import { CiServer } from 'react-icons/ci';
import { PiDatabaseThin } from 'react-icons/pi';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { useDispatch } from 'react-redux';
import { setState } from '@services/docker/container/slice';
import './DockerContainerFooter.css';

const DockerContainerFooter = ({ container }) => {
    const dispatch = useDispatch();

    const selectContainerHandler = () => {
        const { environment } = container;
        const variables = Object.entries(environment.variables);
        dispatch(dockerContainerSlice.setState({
            path: 'selectedDockerContainer',
            value: { ...container, environment: { variables } }
        }));
    };
    
    const options = [
        ['Expose Port', IoCloudOutline, '/port-binding/create/'],
        ['Environment Variables', PiDatabaseThin, `/docker-container/${container._id}/environment-variables/`, selectContainerHandler],
        ['File Explorer', CiServer]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerContainerFooter;