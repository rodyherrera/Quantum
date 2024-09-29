import React from 'react';
import { IoIosMore } from 'react-icons/io';
import { formatDate } from '@utilities/runtime';
import ContextMenu from '@components/organisms/ContextMenu';
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
        <div className='Docker-Container-Body'>
            <div className='Docker-Container-Name-Container'>
                <h3 className='Docker-Container-Name'>
                    {container.isUserContainer ? (
                        'Main Docker Container'
                    ) : (
                        container.name
                    )}
                </h3>
                <ContextMenu 
                    className='Docker-Container-More-Icon-Container' 
                    options={ctxMenuOpts}
                >
                    <i>
                        <IoIosMore />
                    </i>
                </ContextMenu>
            </div>
            <p className='Docker-Container-Last-Update'>Last update {formatDate(container.updatedAt)}, created at {formatDate(container.createdAt, true)}.</p>
        </div>
    )
};

export default DockerContainerBody;