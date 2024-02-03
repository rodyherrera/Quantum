import React, { useEffect } from 'react';
import { getMyGithubRepositories, createRepository } from '@services/repository/operations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataRenderer from '@components/general/DataRenderer';
import RepositoryBasicItem from '@components/repository/RepositoryBasicItem';
import * as repositoriesSlice from '@services/repository/slice';
import './CreateRepository.css';

const CreateRepository = () => {
    const { repositories, isLoading, isOperationLoading, error } = useSelector(state => state.repository);
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
        <DataRenderer
            title="Let's start our teamwork..."
            id='Create-Repository-Main'
            error={error}
            description='To deploy a new Project, import an existing Git Repository.'
            isLoading={isLoading}
            isOperationLoading={isOperationLoading}
            operationLoadingMessage="We're cloning and adjusting parameters in your repository..."
            data={repositories}
            emptyDataMessage='There are no repositories in your Github account.'
            emptyDataBtn={{
                title: 'Go to Github',
                to: 'https://github.com/'
            }}
            breadcrumbItems={[
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Repositories', to: '/dashboard/' },
                { title: 'Create Repository', to: '/respository/create/' }
            ]}
        >
            <article id='Github-Account-Repository-List-Container'>
                {repositories.map((repository, index) => (
                    <RepositoryBasicItem 
                        key={index} 
                        onClick={() => handleClick(repository)}
                        repository={repository} />
                ))}
            </article>
        </DataRenderer>
    );
};

export default CreateRepository;