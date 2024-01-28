import React, { useEffect } from 'react';
import Project from '@components/dashboard/Project';
import Button from '@components/general/Button';
import DataRenderer from '@components/general/DataRenderer';
import { useSelector, useDispatch } from 'react-redux';
import { getRepositories } from '@services/repository/actions';
import { HiPlus } from 'react-icons/hi';
import * as repositoriesSlice from '@services/repository/slice';
import './Dashboard.css';

const Dashboard = () => {
    const { repositories, isLoading } = useSelector(state => state.repository);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getRepositories());
        const intervalId = setInterval(() => {
            dispatch(getRepositories(false));
        }, 15000);
        return () => {
            clearInterval(intervalId);
            dispatch(repositoriesSlice.setRepositories([]));
            dispatch(repositoriesSlice.setIsLoading(true));
        };
    }, [dispatch]);

    return (
        <DataRenderer
            title='Dashboard'
            description='The instances of your applications stored on the server.'
            isLoading={isLoading}
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