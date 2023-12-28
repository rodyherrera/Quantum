import React, { useEffect } from 'react';
import Input from '@components/general/Input';
import Button from '@components/general/Button';
import Project from '@components/dashboard/Project';
import { useSelector, useDispatch } from 'react-redux';
import { getRepositories } from '@services/repository/actions';
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
                <article id='Dashboard-Input-Container'>
                    <Input  type='text' placeholder='Search' />
                </article>
                <Button title='Create new' />
            </section>

            <section id='Dashboard-Body-Container'>
                <article id='Dashboard-Projects-Container'>
                    {repositories.map((repository, index) => (
                        <Project
                            key={index}
                            title={repository.name}
                            url='quantum-cloud.codewithrodi.com'
                            commitMessage='lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                            lastUpdate='2'
                            branch='master'
                        />
                    ))}
                </article>
            </section>
        </main>
    );
};

export default Dashboard;