import React from 'react';
import { DashboardCardBody } from '@components/atoms/DashboardCard';
import './DockerContainerBody.css';

const DockerContainerBody = ({ container }) => {
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
            name={container?.isUserContainer ? 'Main Docker Container' : container.name}
            ctxMenuOpts={ctxMenuOpts}
            createdAt={container.createdAt}
            updatedAt={container.updatedAt}
        />
    );
};

export default DockerContainerBody;