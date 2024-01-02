import React, { useEffect } from 'react';
import Project from '@components/dashboard/Project';
import { useSelector, useDispatch } from 'react-redux';
import { getRepositories } from '@services/repository/actions';
import { CircularProgress } from '@mui/material';
import * as repositoriesSlice from '@services/repository/slice';
import './Dashboard.css';

const Dashboard = () => {
    const { repositories, isLoading } = useSelector(state => state.repository);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getRepositories());
        return () => {
            dispatch(repositoriesSlice.setRepositories([]));
        };
    }, []);

    return (
        <main id='Dashboard-Main'>
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
                            <p id='Dashboard-Projects-Empty'>You have no projects yet.</p>
                        </article>
                    ) : (
                        <article id='Dashboard-Projects-Container'>
                            {repositories.map((repository, index) => (
                                <Project key={index} repository={repository} />
                            ))}
                        </article>
                    )
                )}
            </section>
        </main>
    );
};

export default Dashboard;