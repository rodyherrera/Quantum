import React, { useEffect } from 'react';
import Project from '@components/dashboard/Project';
import Button from '@components/general/Button';
import Breadcrumbs from '@components/general/Breadcrumbs';
import { useSelector, useDispatch } from 'react-redux';
import { getRepositories } from '@services/repository/actions';
import { HiPlus } from 'react-icons/hi';
import { CircularProgress } from '@mui/material';
import * as repositoriesSlice from '@services/repository/slice';
import './Dashboard.css';

const Dashboard = () => {
    const { repositories, isLoading, isOperationLoading } = useSelector(state => state.repository);
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
        <main id='Dashboard-Main'>
            {(isOperationLoading) && (
                <aside id='Dashboard-Loading-Container'>
                    <CircularProgress size='2.5rem' />
                </aside>
            )}

            <section id='Dashboard-Header-Container'>
                <article id='Dashboard-Header-Title-Container'>
                    <Breadcrumbs 
                        items={[
                            { title: 'Home', to: '/' },
                            { title: 'Dashboard', to: '/dashboard/' },
                            { title: 'Repositories', to: '/dashboard/' }
                        ]} />
                    <h1 id='Dashboard-Header-Title'>Dashboard</h1>
                    <p id='Dashboard-Header-Subtitle'>The instances of your applications stored on the server.</p>
                </article>
                <article id='Dashboard-Header-Actions-Container'>
                    {(!isLoading) && (
                        <Button 
                            to='/repository/create/'
                            title='Create new' 
                            variant='Contained End-Icon' 
                            icon={<HiPlus />} />
                    )}
                </article>
            </section>

            <section id='Dashboard-Body-Container'>
                {(isLoading) ? (
                    <CircularProgress size='2.5rem' />
                ) : (
                    (repositories.length === 0) ? (
                        <article id='Dashboard-Projects-Empty-Container'>
                            <p id='Dashboard-Projects-Empty'>You still don't have projects with us.</p>
                            <Button title='Create Project' to='/repository/create' />
                        </article>
                    ) : (
                        <article id='Dashboard-Projects-Container'>
                            {repositories.map((repository, index) => (
                                <Project 
                                    key={index} 
                                    repository={repository} />
                            ))}
                        </article>
                    )
                )}
            </section>
        </main>
    );
};

export default Dashboard;