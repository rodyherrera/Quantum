import React from 'react';
import { DockerNetworkHeader, DockerNetworkBody, DockerNetworkFooter } from '@components/molecules/Docker/DockerNetwork';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './DockerNetwork.css';

const DockerNetwork = ({ network }) => {

    return (
        <DashboardCard>
            <DockerNetworkHeader network={network} />
            <DockerNetworkBody network={network} />
            <DockerNetworkFooter network={network} />
        </DashboardCard>
    );
};

export default DockerNetwork;