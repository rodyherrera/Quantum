import React, { useEffect } from 'react';
import Project from '@components/dashboard/Project';
import Button from '@components/general/Button';
import { useSelector, useDispatch } from 'react-redux';
import { getRepositories } from '@services/repository/actions';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import * as repositoriesSlice from '@services/repository/slice';
import './Dashboard.css';

const Dashboard = () => {
    const { repositories, isLoading, isOperationLoading } = useSelector(state => state.repository);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getRepositories());
        return () => {
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
                    <h1 id='Dashboard-Header-Title'>Dashboard</h1>
                    <p id='Dashboard-Header-Subtitle'>The instances of your applications stored on the server.</p>
                </article>
            </section>

            <section id='Dashboard-Body-Container'>
                {(isLoading) ? (
                    <CircularProgress size='2.5rem' />
                ) : (
                    (repositories.length === 0) ? (
                        <article id='Dashboard-Projects-Empty-Container'>
                            <p id='Dashboard-Projects-Empty'>You still don't have projects with us.</p>
                            <Button title='Create Project' to='/repository/create' variant='primary' />
                        </article>
                    ) : (
                        <article id='Dashboard-Projects-Container'>
                            {repositories.map((repository, index) => (
                                <Project 
                                    key={index} 
                                    onClick={() => navigate(`/repository/${repository.name}/deployment/setup/`, { state: { repository } })}
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