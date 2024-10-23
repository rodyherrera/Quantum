import React from 'react';
import { DockerImageHeader, DockerImageBody, DockerImageFooter } from '@components/molecules/Docker/DockerImage';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './DockerImage.css';

const DockerImage = ({ image }) => {

    return (
        <DashboardCard>
            <DockerImageHeader image={image} />
            <DockerImageBody image={image} />
            <DockerImageFooter image={image} />
        </DashboardCard>
    );
};

export default DockerImage;