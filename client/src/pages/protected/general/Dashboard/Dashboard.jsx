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

import React, { useLayoutEffect, useRef } from 'react';
import Project from '@components/organisms/Project';
import Button from '@components/atoms/Button';
import useUserRepositories from '@hooks/useUserRepositories';
import useUserDockerContainers from '@hooks/useUserDockerContainers';
import DataRenderer from '@components/organisms/DataRenderer';
import DockerContainer from '@components/organisms/DockerContainer';
import { HiPlus } from 'react-icons/hi';
import { gsap } from 'gsap';
import './Dashboard.css';

const Dashboard = () => {
    const { repositories, isLoading, isOperationLoading, error } = useUserRepositories();
    const { dockerContainers } = useUserDockerContainers();
    const createRepoBtnRef = useRef(null);

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
            isLoading={isLoading}
            isOperationLoading={isOperationLoading}
            data={repositories}
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
            <div id='Dashboard-Projects-Container'>
                {repositories.map((repository, index) => (
                    <Project key={index} repository={repository} />
                ))}
            </div>

            <div id='Dashboard-Docker-Container'>
                {dockerContainers.map((container, index) => (
                    <DockerContainer container={container} key={index} />
                ))}
            </div>
        </DataRenderer>
    );
};

export default Dashboard;