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

import React, { useEffect } from 'react';
import { getMyGithubRepositories, createRepository } from '@services/repository/operations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataRenderer from '@components/general/DataRenderer';
import RepositoryBasicItem from '@components/repository/RepositoryBasicItem';
import RelatedRepositorySections from '@components/repository/RelatedRepositorySections';
import './CreateRepository.css';

const CreateRepository = () => {
    const { githubRepositories, isLoading, isOperationLoading, error } = useSelector(state => state.repository);
    const { user } = useSelector(state => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    useEffect(() => {
        dispatch(getMyGithubRepositories());
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
            data={githubRepositories}
            emptyDataMessage='There are no repositories in your Github account.'
            RightContainerComponent={RelatedRepositorySections}
            emptyDataBtn={{
                title: 'Go to Github',
                to: 'https://github.com/'
            }}
            breadcrumbItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Repositories', to: '/dashboard/' },
                { title: 'Create Repository', to: '/respository/create/' }
            ]}
        >
            <article id='Github-Account-Repository-List-Container'>
                {githubRepositories.map((repository, index) => (
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