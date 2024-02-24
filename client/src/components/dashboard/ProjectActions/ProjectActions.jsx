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

import React from 'react';
import { IoIosMore } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRepository } from '@services/repository/slice';
import ContextMenu from '@components/contextMenu/ContextMenu';
import * as repositoryOperations from '@services/repository/operations';
import './ProjectActions.css';

const ProjectActions = ({ repository }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositories } = useSelector(state => state.repository);

    const handleRepositorySelection = (path) => {
        dispatch(setSelectedRepository(repository));
        navigate(path);
    };

    return (
        <div className='Project-Actions-Container'>
            <ContextMenu 
                className='Project-More-Icon-Container' 
                options={[
                    { title: 'Delete', onClick: () => dispatch(repositoryOperations.deleteRepository(repository._id, repositories, navigate)) },
                    { title: 'Build & Dev Settings',  onClick: () => handleRepositorySelection(`/repository/${repository.alias}/deployment/setup/`) },
                    { title: 'Environment Variables',  onClick: () => handleRepositorySelection(`/repository/${repository.alias}/deployment/environment-variables/`) },
                    { title: 'File Explorer',  onClick: () => handleRepositorySelection(`/repository/${repository.alias}/storage/`) },
                    { title: 'Shell', onClick: () => handleRepositorySelection(`/repository/${repository.alias}/shell/`) },
                    { title: 'Deployments', onClick: () => handleRepositorySelection(`/repository/${repository.alias}/deployments/`) }
                ]}
            >
                <i>
                    <IoIosMore />
                </i>
            </ContextMenu>

            <div 
                data-status={repository.activeDeployment.status}
                className='Project-Actions-Deployment-Status'
            />
        </div>
    );
};

export default ProjectActions;