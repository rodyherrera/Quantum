import React from 'react';
import { IoIosMore } from 'react-icons/io';
import { IoCloudOutline } from "react-icons/io5";
import { CiServer } from 'react-icons/ci';
import { PiDatabaseThin } from "react-icons/pi";
import { humanFileSize, formatDate } from '@utilities/runtime';
import ContextMenu from '@components/organisms/ContextMenu';
import './DockerContainer.css';

const DockerContainer = ({ container }) => {

    return (
        <div className='Docker-Container'>
            <div className='Docker-Container-Header'>
                {[
                    container.ipAddress ? `Subnet: ${container.ipAddress}` : 'Unallocated Subnet IP',
                    `${container.image.name}:${container.image.tag} ${humanFileSize(container.image.size)}`,
                    `Status: ${container.status}`
                ].map((item, index) => (
                    <p className='Docker-Container-Header-Item' key={index}>{item}</p>
                ))}
            </div>
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
                        options={[
                            { title: 'Delete Permanently' },
                            { title: 'Edit Container' },
                            { title: 'Expose Ports' },
                            { title: 'Environment Variables' },
                            { title: 'File Explorer' },
                            { title: 'Container Terminal' },
                            { title: 'Edit Container Network' },
                            { title: 'Edit Container Image' }
                        ]}
                    >
                        <i>
                            <IoIosMore />
                        </i>
                    </ContextMenu>
                </div>
                <p className='Docker-Container-Last-Update'>Last update {formatDate(container.updatedAt)}, created at {formatDate(container.createdAt, true)}.</p>
            </div>
            <div className='Docker-Container-Footer'>
                <div className='Docker-Container-Footer-Left-Container'>
                    {[
                        ['Expose Port', IoCloudOutline],
                        ['Environment Variables', PiDatabaseThin],
                        ['File Explorer', CiServer]
                    ].map(([ item, Icon ], index) => (
                        <div className='Docker-Container-Footer-Option-Container' key={index}>
                            <i className='Docker-Container-Footer-Option-Icon-Container'>
                                <Icon />
                            </i>
                            <p className='Docker-Container-Footer-Option-Title'>{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DockerContainer;