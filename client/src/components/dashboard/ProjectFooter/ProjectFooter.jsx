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

import React, { useState, useEffect } from 'react';
import { FaGithub } from 'react-icons/fa';
import { IoIosGitBranch } from 'react-icons/io';
import { formatDate } from '@utilities/runtime';
import { useDispatch } from 'react-redux';
import { repositoryActions } from '@services/deployment/operations';
import Button from '@components/general/Button';
import './ProjectFooter.css';

const ProjectFooter = ({ repository }) => {
    const dispatch = useDispatch();
    const [perfomedAction, setPerformedAction] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /** Handles starting, stopping, or restarting deployment */
    const handleDeploymentAction = async (action) => {
        dispatch(repositoryActions(repository.alias, setIsLoading, { action }));
        setPerformedAction(action);
    };

    const isActionLoading = (action) => {
        return isLoading && (perfomedAction === action);
    };

    useEffect(() => {
        return () => {
            setPerformedAction('');
            setIsLoading(false);
        };
    }, []);

    return (
        <div className='Project-Footer-Container'>
            <p className='Project-Update-Message'>
                <i className='Project-Github-Icon-Container'>
                    <FaGithub />
                </i>
                <span>{formatDate(repository.latestCommit)} on</span>
                <i className='Project-Github-Branch-Icon-Container'>
                    <IoIosGitBranch />
                </i>
                <span>{repository.branch}</span>
            </p>
            <div className='Project-Startup-Container'>
                {(repository.activeDeployment.status == 'stopped') ? (
                    <Button 
                        title='Start' 
                        isLoading={isActionLoading('start')}
                        onClick={() => handleDeploymentAction('start')}
                        variant='Contained Small' /> 
                ) : (
                    <Button 
                        title='Stop' 
                        isLoading={isActionLoading('stop')}
                        onClick={() => handleDeploymentAction('stop')}
                        variant='Contained Small' />
                )}
                <Button 
                    title='Restart' 
                    isLoading={isActionLoading('restart')}
                    onClick={() => handleDeploymentAction('restart')}
                    variant='Small' />
            </div>
        </div>
    );
};

export default ProjectFooter;