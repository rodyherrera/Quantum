import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import './PortBindingBody.css';

const PortBindingBody = ({ portBinding }) => {
    const ctxMenuOpts = [
        { title: 'Delete Permanently' },
        { title: 'Edit Container' },
        { title: 'Expose Ports', to: `/port-binding/create/` },
        { title: 'Environment Variables', to: `/docker-container/${portBinding.container._id}/environment-variables/` },
        { title: 'File Explorer', to: `/docker-container/${portBinding.container._id}/storage` },
        { title: 'Container Terminal', to: `/docker-container/${portBinding.container._id}/shell` },
        { title: 'Edit Container Network' },
        { title: 'Edit Container Image' }
    ];

    return (
        <DashboardCardBody
            name={`${portBinding.container.ipAddress}:${portBinding.internalPort}->${portBinding.externalPort}`}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={portBinding.createdAt}
            updatedAt={portBinding.updatedAt}
        />
    );
};

export default PortBindingBody;