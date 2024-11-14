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

import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useDocumentTitle } from '@hooks/common';
import EnvironmentVariables from '@components/organisms/EnvironmentVariables';
import * as deploymentSlice from '@services/deployment/slice';
import * as deploymentOperations from '@services/deployment/operations';
import './EnvironmentVariables.css';

const EnvironVariables = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositoryAlias } = useParams();
    const { selectedRepository } = useSelector((state) => state.repository);
    const { 
        isEnvironmentLoading, 
        isOperationLoading, 
        environment } = useSelector((state) => state.deployment);
    useDocumentTitle('Environment Variables');

    const initEnviron = useCallback(() => {
        if(!selectedRepository){
            navigate('/dashboard');
            return;
        }
        dispatch(deploymentOperations.getActiveDeploymentEnvironment(selectedRepository.alias));
    }, [dispatch, selectedRepository, navigate]);

    const environUpdate = useCallback((environment) => {
        const body = { environment };
        dispatch(deploymentOperations.updateDeployment(environment._id, body, navigate));
    }, [dispatch, environment, navigate]);

    const updateHandler = useCallback((variables) => {
        const updatedEnvironment = { ...environment, variables };
        dispatch(deploymentSlice.setState({
            path: 'environment',
            value: updatedEnvironment
        }));
    }, [dispatch, environment]);

    const breadcrumbs = useMemo(() => {
        return [
            { title: 'Home', to: '/' },
            { title: 'Dashboard', to: '/dashboard/' },
            { title: repositoryAlias, to: '/dashboard/' },
            { title: 'Environment Variables', to: `/repository/${repositoryAlias}/deployment/environment-variables/` }
        ];
    }, [repositoryAlias]);

    useEffect(() => {
        initEnviron();
    }, [initEnviron]);

    return <EnvironmentVariables
        title='Environment Variables'
        description='To provide your implementation with environment variables at compile and run time, you can enter them right here. If there are any .env files in the root of your repository, these are mapped and loaded automatically when deploying.'
        handleSave={environUpdate}
        updateHandler={updateHandler}
        isOperationLoading={isOperationLoading}
        isEnvironmentLoading={isEnvironmentLoading}
        environment={environment}
        breadcrumbs={breadcrumbs}
    />
};

export default EnvironVariables;