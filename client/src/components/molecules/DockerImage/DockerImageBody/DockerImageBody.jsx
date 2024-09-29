import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import './DockerImageBody.css';

const DockerImageBody = ({ image }) => {
    const ctxMenuOpts = [
        { title: 'Delete Permanently' },
        { title: 'Edit Network' }
    ];

    return (
        <DashboardCardBody
            name={image.name}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={image.createdAt}
            updatedAt={image.updatedAt}
        />
    );
};

export default DockerImageBody;