/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { FiGithub } from 'react-icons/fi';
import { IoLogoDocker } from 'react-icons/io5';
import { HiPlus } from 'react-icons/hi';
import { gsap } from 'gsap';
import { IoIosMore } from 'react-icons/io';
import { IoCloudOutline } from "react-icons/io5";
import { CiServer } from 'react-icons/ci';
import { PiDatabaseThin } from "react-icons/pi";
import { humanFileSize, formatDate } from '@utilities/runtime';
import ContextMenu from '@components/organisms/ContextMenu';
import Project from '@components/organisms/Project';
import DashboardModule from '@components/organisms/DashboardModule';
import Button from '@components/atoms/Button';
import DataRenderer from '@components/organisms/DataRenderer';
import * as userHooks from '@hooks/api/user/';
import './Dashboard.css';


const Dashboard = () => {
    const { repositories, isLoading, isOperationLoading, error } = userHooks.useUserRepositories();
    const { dockerContainers } = userHooks.useUserDockerContainers();
    const { dockerNetworks } = userHooks.useUserDockerNetworks();
    const { dockerImages } = userHooks.useUserDockerImages();
    const createRepoBtnRef = useRef(null);

    useEffect(() => {
        console.log(dockerContainers);
    }, [dockerContainers]);

    useLayoutEffect(() => {
        if(isLoading) return;
        gsap.fromTo(createRepoBtnRef.current, { 
            opacity: 0, 
            x: -20,
            duration: 0.3, 
            ease: 'power2.out' 
        }, {
            opacity: 1,
            x: 0
        });
    }, [isLoading]);
    
    return (
        <DataRenderer
            title='Dashboard'
            error={error}
            id='Dashboard-Main'
            description='The instances of your applications stored on the server.'
            isLoading={false}
            isOperationLoading={isOperationLoading}
            data={['']}
            emptyDataMessage="You still don't have projects with us."
            emptyDataBtn={{
                title: 'Create Project',
                to: '/repository/create/'
            }}
            breadcrumbItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Repositories', to: '/dashboard/' }
            ]}
            headerRightContainer={() => (
                (!isLoading) && (
                    <Button 
                        ref={createRepoBtnRef}
                        to='/repository/create/'
                        title='Create new' 
                        variant='Contained End-Icon' 
                        icon={<HiPlus />} />
                )
            )}
        >
            <DashboardModule
                title='Your Github Repositories'
                Icon={FiGithub}
                createLink='/repository/create/'
                alias='repositorie(s)'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Projects-Container'>
                        {repositories.map((repository, index) => (
                            <Project key={index} repository={repository} />
                        ))}
                    </div>
                )}
            />

            <DashboardModule
                title='Docker Containers'
                Icon={IoLogoDocker}
                alias='container(s)'
                createLink='/docker-container/create/'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Dockers-Container'>
                        {dockerContainers.map((container, index) => (
                            <div className='Docker-Container' key={index}>
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
                        ))}
                    </div>
                )}
            />

            <DashboardModule
                title='Docker Networks'
                createLink='/docker-network/create/'
                Icon={IoLogoDocker}
                alias='network(s)'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Dockers-Networks'>
                        {dockerNetworks.map((container, index) => (
                            <div className='Docker-Container' key={index}>
                                <h3 className='Docker-Container-Name'>{container.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            />

            <DashboardModule
                title='Docker Images'
                Icon={IoLogoDocker}
                alias='image(s)'
                createLink='/docker-image/create/'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Dockers-Images'>
                        {dockerImages.map((container, index) => (
                            <div className='Docker-Container' key={index}>
                                <h3 className='Docker-Container-Name'>{container.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            />
        </DataRenderer>
    );
};

export default Dashboard;