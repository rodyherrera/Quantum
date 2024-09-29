import React from 'react';
import {
    DockerContainerHeader,
    DockerContainerBody,
    DockerContainerFooter,
} from '@components/molecules/Docker/DockerContainer';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './DockerContainer.css';

const DockerContainer = ({ container }) => {

    return (
        <DashboardCard>
            <DockerContainerHeader container={container} />
            <DockerContainerBody container={container} />
            <DockerContainerFooter container={container} />
        </DashboardCard>
    );
};

export default DockerContainer;