import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DeploymentItem from '@components/deployment/DeploymentItem';
import DataRenderer from '@components/general/DataRenderer';
import * as deploymentActions from '@services/deployment/actions';
import './RepositoryDeployments.css';

const RepositoryDeployments = () => {
    const dispatch = useDispatch();
    const { repositoryName } = useParams();
    const { deployments, isLoading, isOperationLoading, error } = useSelector(state => state.deployment);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(deploymentActions.getRepositoryDeployments(repositoryName));
    }, []);

    return (
        <DataRenderer
            title='Deployments'
            id='Repository-Deployments-Main'
            error={error}
            description={`Continuously generated from ${user.github.username}/${repositoryName}`}
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
                { title: 'Dashboard', to: '/dashboard/' },
                { title: 'Repositories', to: '/dashboard/' },
                { title: repositoryName, to: '/dashboard/' },
                { title: 'Deployments', to: `/repository/${repositoryName}/deployments/` }
            ]}
        >
            <div id='Repository-Deployments-Body-List'>
                {deployments.map((deployment, index) => (
                    <DeploymentItem 
                        key={index} 
                        deployment={deployment} 
                        repositoryName={repositoryName} />
                ))}
            </div>
        </DataRenderer>
    );
};

export default RepositoryDeployments;