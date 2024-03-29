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

import React, { useEffect, useRef } from 'react';
import Project from '@components/dashboard/Project';
import Button from '@components/general/Button';
import DataRenderer from '@components/general/DataRenderer';
import { useSelector, useDispatch } from 'react-redux';
import { getRepositories } from '@services/repository/operations';
import { HiPlus } from 'react-icons/hi';
import { setRepositories, setIsLoading } from '@services/repository/slice';
import { gsap } from 'gsap';
import './Dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { repositories, isLoading, isOperationLoading, error } = useSelector(state => state.repository);
    const createRepoBtnRef = useRef(null);

    useEffect(() => {
        dispatch(getRepositories());
        const intervalId = setInterval(() => {
            dispatch(getRepositories(false));
        }, 15000);
        return () => {
            clearInterval(intervalId);
            dispatch(setRepositories([]));
            dispatch(setIsLoading(true));
        };
    }, [dispatch]);

    useEffect(() => {
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
                    <Project 
                        key={index} 
                        repository={repository} />
                ))}
            </div>
        </DataRenderer>
    );
};

export default Dashboard;