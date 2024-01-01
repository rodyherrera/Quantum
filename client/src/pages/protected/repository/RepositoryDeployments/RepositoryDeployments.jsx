import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DeploymentItem from '@components/deployment/DeploymentItem';
import * as deploymentActions from '@services/deployment/actions';
import './RepositoryDeployments.css';

const RepositoryDeployments = () => {
    const dispatch = useDispatch();
    const { repositoryName } = useParams();
    const { deployments } = useSelector(state => state.deployment);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(deploymentActions.getRepositoryDeployments(repositoryName));
    }, []);
    
    return (
        <main id='Repository-Deployments-Main'>
            <section id='Repository-Deployments-Header'>
                <h1 id='Repository-Deployments-Header-Title'>Deployments</h1>
                <p id='Repository-Deployments-Header-Subtitle'>Continuously generated from {user.github.username}/{repositoryName}</p>
            </section>

            <section id='Repository-Deployments-Body'>
                <article id='Repository-Deployments-Body-List'>
                    {deployments.map((deployment, index) => (
                        <DeploymentItem 
                            key={index} 
                            deployment={deployment} 
                            repositoryName={repositoryName} />
                    ))}
                </article>
            </section>
        </main>
    );
};

export default RepositoryDeployments;