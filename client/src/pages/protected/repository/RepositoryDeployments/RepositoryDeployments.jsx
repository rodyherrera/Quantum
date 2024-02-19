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
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DeploymentItem from '@components/deployment/DeploymentItem';
import DataRenderer from '@components/general/DataRenderer';
import * as deploymentOperations from '@services/deployment/operations';
import './RepositoryDeployments.css';

const RepositoryDeployments = () => {
    const dispatch = useDispatch();
    const { repositoryAlias } = useParams();
    const { selectedRepository } = useSelector(state => state.repository);
    const { deployments, isLoading, isOperationLoading, error } = useSelector(state => state.deployment);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(deploymentOperations.getRepositoryDeployments(selectedRepository.name));
    }, []);

    return (
        <DataRenderer
            title='Deployments'
            id='Repository-Deployments-Main'
            error={error}
            description={`Continuously generated from ${user.github.username}/${selectedRepository.name}`}
            isLoading={isLoading}
            isOperationLoading={isOperationLoading}
            operationLoadingMessage='Processing, please wait a few seconds...'
            data={deployments}
            emptyDataMessage='There is no deployment registered in the repository.'
            emptyDataBtn={{
                title: 'Create Deployment',
                to: '/repository/create/'
            }}
            breadcrumbItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Repositories', to: '/dashboard/' },
                { title: repositoryAlias, to: '/dashboard/' },
                { title: 'Deployments', to: `/repository/${repositoryAlias}/deployments/` }
            ]}
        >
            <div id='Repository-Deployments-Body-List'>
                {deployments.map((deployment, index) => (
                    <DeploymentItem 
                        key={index} 
                        deployment={deployment} 
                        repository={selectedRepository} />
                ))}
            </div>
        </DataRenderer>
    );
};

export default RepositoryDeployments;