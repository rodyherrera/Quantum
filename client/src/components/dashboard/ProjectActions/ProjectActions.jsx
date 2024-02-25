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

import React, { useState } from 'react';
import { IoIosMore } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedRepository } from '@services/repository/slice';
import { deleteRepository } from '@services/repository/operations';
import ContextMenu from '@components/contextMenu/ContextMenu';
import ConfirmModal from '@components/general/ConfirmModal';
import './ProjectActions.css';

const ProjectActions = ({ repository }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositories } = useSelector(state => state.repository);
    const [isDeleteModalActive, setIsDeleteModalActive] = useState(false);

    const handleRepositorySelection = (path) => {
        dispatch(setSelectedRepository(repository));
        navigate(path);
    };

    return (
        <ConfirmModal
            highlightTitle='Delete'
            title='Project'
            isActive={isDeleteModalActive}
            setIsActive={setIsDeleteModalActive}
            description='The deployments associated with your repository along with all its configuration within the platform will be permanently deleted. Only deployments associated with your account will be deleted.'
            warning='This action is not reversible. Please be certain.'
            confirmHandler={() => dispatch(deleteRepository(repository._id, repositories, navigate))}
            firstInputRender={(
                <span className='Confirm-Modal-Input-Title'>
                    Enter the project name <span className='Font-Bold'>{repository.name}</span> to continue:
                </span>
            )}
            firstInputMatch={repository.name}
            lastInputRender={(
                <span className='Confirm-Modal-Input-Title'>
                    To verify, type <span className='Font-Bold'>delete my project</span> below:
                </span>
            )}
            lastInputMatch='delete my project'
        >
            <div className='Project-Actions-Container'>
                <ContextMenu 
                    className='Project-More-Icon-Container' 
                    options={[
                        { title: 'Delete', onClick: () => setIsDeleteModalActive(true) },
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
                    className='Project-Actions-Deployment-Status' />
            </div>
        </ConfirmModal>
    );
};

export default ProjectActions;