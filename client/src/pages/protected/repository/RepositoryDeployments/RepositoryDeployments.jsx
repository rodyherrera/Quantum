import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as deploymentActions from '@services/deployment/actions';
import './RepositoryDeployments';

const RepositoryDeployments = () => {
    const dispatch = useDispatch();
    const { repositoryName } = useParams();
    const { deployments } = useSelector(state => state.deployment);

    useEffect(() => {
        dispatch(deploymentActions.getRepositoryDeployments(repositoryName));
    }, []);

    useEffect(() => {
        console.log(deployments);
    }, [deployments]);

    return (
        <main id='Repository-Deployments-Main'>
            <h1>Repository Deployments</h1>
        </main>
    );
};

export default RepositoryDeployments;