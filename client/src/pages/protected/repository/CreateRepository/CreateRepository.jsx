import React, { useEffect } from 'react';
import { getMyGithubRepositories, createRepository } from '@services/repository/actions';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RepositoryBasicItem from '@components/repository/RepositoryBasicItem';
import * as repositoriesSlice from '@services/repository/slice';
import './CreateRepository.css';

const CreateRepository = () => {
    const { repositories, isLoading, isCreatingRepo } = useSelector(state => state.repository);
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
            name: repository.full_name,
            url: repository.html_url,
            user: user._id
        };
        try{
            await dispatch(createRepository(body));
            navigate('/dashboard/');
        }catch(error){
            console.log(error);
        }
    };

    return (
        <main id='Create-Repository-Main'>
            <section id='Create-Repository-Header'>
                <article id='Create-Repository-Header-Title-Container'>
                    <h1 id='Create-Repository-Header-Title'>Let's start our teamwork...</h1>
                    <p id='Create-Repository-Header-Subtitle'>To deploy a new Project, import an existing Git Repository.</p>
                </article>
            </section>

            <section id='Create-Repository-Body' data-iscreatingrepo={isCreatingRepo}>
                {isCreatingRepo && (
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