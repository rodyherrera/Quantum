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
    const { deployments, isLoading, isOperationLoading, error } = useSelector(state => state.deployment);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(deploymentOperations.getRepositoryDeployments(repositoryAlias));
    }, []);

    return (
        <DataRenderer
            title='Deployments'
            id='Repository-Deployments-Main'
            error={error}
            description={`Continuously generated from ${user.github.username}/${repositoryAlias}`}
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
                        repositoryAlias={repositoryAlias} />
                ))}
            </div>
        </DataRenderer>
    );
};

export default RepositoryDeployments;