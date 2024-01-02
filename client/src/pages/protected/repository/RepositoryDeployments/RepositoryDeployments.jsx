import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { VscGithubInverted } from 'react-icons/vsc';
import DeploymentItem from '@components/deployment/DeploymentItem';
import * as deploymentActions from '@services/deployment/actions';
import './RepositoryDeployments.css';

const RepositoryDeployments = () => {
    const dispatch = useDispatch();
    const { repositoryName } = useParams();
    const { deployments, isLoading, isOperationLoading } = useSelector(state => state.deployment);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(deploymentActions.getRepositoryDeployments(repositoryName));
    }, []);
    
    return (
        <main id='Repository-Deployments-Main'>
            <section id='Repository-Deployments-Header'>
                <h1 id='Repository-Deployments-Header-Title'>Deployments</h1>
                <p id='Repository-Deployments-Header-Subtitle'>
                    <span>Continuously generated from</span>
                    <span id='Repository-Deployment-Generated-From'>
                        <i>
                            <VscGithubInverted />
                        </i> 
                        <span>{user.github.username}/{repositoryName}</span>
                    </span>
                </p>
            </section>

            <section id='Repository-Deployments-Body'>
                {(isLoading) ? (
                    <div id='Repository-Deployments-Body-Loading-Container'>
                        <CircularProgress id='Repository-Deployments-Body-Loading' size='2.5rem' />
                    </div>
                ) : (
                    <article id='Repository-Deployments-Body-List'>
                        {(isOperationLoading) && (
                            <div id='Repository-Deployments-Operation-Loading-Container'>
                                <CircularProgress id='Repository-Deployments-Operation-Loading' size='2.5rem' />
                                <p>Processing, please wait a few seconds...</p>
                            </div>
                        
                        )}
                        {(deployments.length === 0) ? (
                            <div id='Repository-Deployments-Body-List-Empty-Container'>
                                <p id='Repository-Deployments-Body-List-Empty'>No deployments found.</p>
                            </div>
                        ) : (
                            deployments.map((deployment, index) => (
                                <DeploymentItem 
                                    key={index} 
                                    deployment={deployment} 
                                    repositoryName={repositoryName} />
                            ))
                        )}
                    </article>
                )}
            </section>
        </main>
    );
};

export default RepositoryDeployments;