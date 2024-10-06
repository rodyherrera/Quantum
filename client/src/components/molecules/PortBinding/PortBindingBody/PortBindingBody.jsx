import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import './PortBindingBody.css';

const PortBindingBody = ({ portBinding }) => {
    const ctxMenuOpts = [
        { title: 'Delete Permanently' },
        { title: 'Edit Container' },
        { title: 'Expose Ports' },
        { title: 'Environment Variables' },
        { title: 'File Explorer' },
        { title: 'Container Terminal' },
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