import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import './DockerNetworkBody.css';

const DockerNetworkBody = ({ network }) => {
    const ctxMenuOpts = [
        { title: 'Delete Permanently' },
        { title: 'Edit Network' }
    ];

    return (
        <DashboardCardBody
            name={network.name}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={network.createdAt}
            updatedAt={network.updatedAt}
        />
    );
};

export default DockerNetworkBody;