import React, { useEffect } from 'react';
import { getMyGithubRepositories, createRepository } from '@services/repository/actions';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@components/general/Breadcrumbs';
import RepositoryBasicItem from '@components/repository/RepositoryBasicItem';
import * as repositoriesSlice from '@services/repository/slice';
import './CreateRepository.css';

const CreateRepository = () => {
    const { repositories, isLoading, isOperationLoading } = useSelector(state => state.repository);
    const { user } = useSelector(state => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
        dispatch(getMyGithubRepositories());
        return () => {
            dispatch(repositoriesSlice.setRepositories([]));
        };
    }, []);

    const handleClick = async (repository) => {
        const body = {
            name: repository.name,
            url: repository.html_url,
            user: user._id
        };
        await dispatch(createRepository(body, navigate));
    };

    return (
        <main id='Create-Repository-Main'>
            <section id='Create-Repository-Header'>
                <Breadcrumbs
                    items={[
                        { title: 'Dashboard', to: '/dashboard/' },
                        { title: 'Repositories', to: '/dashboard/' },
                        { title: 'Create Repository', to: '/respository/create/' }
                    ]}
                />
                <article id='Create-Repository-Header-Title-Container'>
                    <h1 id='Create-Repository-Header-Title'>Let's start our teamwork...</h1>
                    <p id='Create-Repository-Header-Subtitle'>To deploy a new Project, import an existing Git Repository.</p>
                </article>
            </section>

            <section id='Create-Repository-Body' data-iscreatingrepo={isOperationLoading}>
                {isOperationLoading && (
                    <div id='Create-Repository-Loading-Container'>
                        <CircularProgress />
                    </div>
                )}
                <article id='Github-Account-Repository-List-Container'>
                    {(isLoading) ? (
                        <CircularProgress />
                    ) : (
                        repositories.map((repository, index) => (
                            <RepositoryBasicItem 
                                key={index} 
                                onClick={() => handleClick(repository)}
                                repository={repository} />
                        ))
                    )}
                </article>
            </section>
        </main>
    );
};

export default CreateRepository;