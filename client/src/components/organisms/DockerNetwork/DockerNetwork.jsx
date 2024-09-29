import React from 'react';
import { DockerNetworkHeader, DockerNetworkBody } from '@components/molecules/DockerNetwork';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './DockerNetwork.css';

const DockerNetwork = ({ network }) => {

    return (
        <DashboardCard>
            <DockerNetworkHeader network={network} />
            <DockerNetworkBody network={network} />
        </DashboardCard>
    );
};

export default DockerNetwork;