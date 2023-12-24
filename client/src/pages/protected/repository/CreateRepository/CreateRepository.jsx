import React, { useEffect } from 'react';
import { getMyGithubRepositories } from '@services/repository/actions';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';
import RepositoryBasicItem from '@components/repository/RepositoryBasicItem';
import './CreateRepository.css';

const CreateRepository = () => {
    const { repositories, isLoading } = useSelector(state => state.repository);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getMyGithubRepositories());
    }, []);

    return (
        <main id='Create-Repository-Main'>
            <section id='Create-Repository-Header'>
                <article id='Create-Repository-Header-Title-Container'>
                    <h1 id='Create-Repository-Header-Title'>Let's start our teamwork...</h1>
                    <p id='Create-Repository-Header-Subtitle'>To deploy a new Project, import an existing Git Repository.</p>
                </article>
            </section>

            <section id='Create-Repository-Body'>
                <article id='Github-Account-Repository-List-Container'>
                    {(isLoading) ? (
                        <CircularProgress />
                    ) : (
                        repositories.map(repository => (
                            <RepositoryBasicItem 
                                key={repository.id} 
                                repository={repository} />
                        ))
                    )}
                </article>
            </section>
        </main>
    );
};

export default CreateRepository;