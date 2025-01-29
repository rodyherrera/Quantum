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

import React, { useEffect, useState } from 'react';
import { getMyGithubRepositories, createRepository } from '@services/repository/operations';
import { useSelector, useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { IoIosGitBranch } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { GoArrowRight } from "react-icons/go";
import DataRenderer from '@components/organisms/DataRenderer';
import RepositoryBasicItem from '@components/atoms/RepositoryBasicItem';
import { useDocumentTitle } from '@hooks/common';
import RelatedRepositorySections from '@components/molecules/RelatedRepositorySections';
import './CreateRepository.css';

const CreateRepository = () => {
    const { githubRepositories, isLoading, isOperationLoading, error } = useSelector(state => state.repository);
    const { user } = useSelector(state => state.auth);
    const [selectedRepo, setSelectedRepo] = useState(null);
    useDocumentTitle('Create Repository');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getMyGithubRepositories());
    }, []);

    const handleDeploy = async (repository, branch) => {
        const body = {
            name: repository.name,
            url: repository.html_url,
            user: user._id,
            branch
        };
        await dispatch(createRepository(body, navigate));
    };

    useEffect(() => {
        if(!githubRepositories.length) return;
        gsap.fromTo('.Repository-Item:first-child', {
            opacity: 0,
            // Start slightly smaller
            scale: 0.95
        }, {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power2.out" 
        });
        gsap.fromTo('.Repository-Item:not(:first-child)', {
            y: 50,
            opacity: 0
        }, { 
            y: 0, 
            opacity: 1, 
            duration: .5,
            // A bouncy effect
            ease: "back.out(1.7)"  
        });
    }, [githubRepositories]);
    
    const handleRepoSelection = (repository) => {
        const hasBranches = repository.branches.length > 1;
        if(hasBranches){
            setSelectedRepo(repository);
            return;
        }
        handleDeploy(repository, repository.default_branch);
    };

    return (
        <DataRenderer
            title={selectedRepo ? "We're almost ready..." : "Let's start our teamwork..."}
            id='Create-Repository-Main'
            error={error}
            description={selectedRepo ? 'You just need to specify the branch you want to deploy.' : 'To deploy a new Project, import an existing Git Repository.'}
            isLoading={isLoading}
            isOperationLoading={isOperationLoading}
            operationLoadingMessage="We're cloning and adjusting parameters in your repository..."
            data={githubRepositories}
            RightContainerComponent={() => <RelatedRepositorySections isRepositorySelected={false} />}
            emptyDataMessage='There are no repositories in your Github account.'
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
            {selectedRepo ? (
                <article className='Branch-List-Container'>
                    {selectedRepo.branches.map((branch) => (
                        <div 
                            className='Branch-Container' 
                            data-isdefaultbranch={branch === selectedRepo.default_branch} 
                            key={branch}
                            onClick={() => handleDeploy(selectedRepo, branch)}
                        >
                            <div className='Branch-Left-Container'>
                                <i className='Branch-Icon-Container'>
                                    <IoIosGitBranch />
                                </i>
                                <h3 className='Branch-Name'>{branch}</h3>
                            </div>
                            <div className='Branch-Right-Container'>
                                <i className='Branch-Arrow-Container'>
                                    <GoArrowRight />
                                </i>
                            </div>
                        </div> 
                    ))}
                </article>
            ) : (
                <article id='Github-Account-Repository-List-Container'>
                    {githubRepositories.map((repository, index) => (
                        <RepositoryBasicItem 
                            key={index} 
                            onClick={() => handleRepoSelection(repository)}
                            repository={repository} />
                    ))}
                </article>
                )}
        </DataRenderer>
    );
};

export default CreateRepository;