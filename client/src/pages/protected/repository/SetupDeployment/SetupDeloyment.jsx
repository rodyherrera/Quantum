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
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateRepository } from '@services/repository/operations';
import MinimalForm from '@components/organisms/MinimalForm';
import RelatedRepositorySections from '@components/molecules/RelatedRepositorySections';
import './SetupDeployment.css';

const SetupDeployment = () => {
    const { isOperationLoading, error, selectedRepository } = useSelector((state) => state.repository);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleFormSubmit = (formValues) => {
        dispatch(updateRepository(selectedRepository._id, formValues, navigate));
    };

    useEffect(() => {
        if(!selectedRepository)
            return navigate('/dashboard/');
    }, []);

    return <MinimalForm
        headerTitle='Build & Development Setting'
        headerSubtitle='We need to know some information about your project.'
        submitButtonTitle='Continue'
        isLoading={isOperationLoading}
        error={error}
        handleFormSubmit={handleFormSubmit}
        breadcrumbsItems={[
            { title: 'Home', to: '/' },
            { title: 'Dashboard', to: '/dashboard/' },
            { title: 'Repositories', to: '/dashboard/' },
            { title: selectedRepository.name, to: '/dashboard/' },
            { title: 'Build & Dev Settings', to: `/repository/${selectedRepository.name}/deployment/setup/` }
        ]}
        RightContainerComponent={RelatedRepositorySections}
        formInputs={[
            {
                type: 'text',
                name: 'alias',
                value: selectedRepository?.alias,
                helperText: 'Enter an alias to identify your repository within the platform. This must be unique in your account, that is, you must not have two or more repositories with the same alias.',
                placeholder: 'For example: "My Blog Application [Frontend]"'
            },
            {
                type: 'text',
                name: 'buildCommand',
                value: selectedRepository?.buildCommand,
                helperText: 'The command your framework provides for compiling your code. If your framework does not require a build, leave this field empty.',
                placeholder: '`yarn build`, `pnpm build`, `npm build`, or `bun build`'
            },
            {
                type: 'text',
                name: 'installCommand',
                value: selectedRepository?.installCommand,
                helperText: 'The command that us used to install your project dependencies. If you do not need to install dependencies, leave this field empty.',
                placeholder: '`yarn install`, `pnpm install`, `npm install`, or `bun install`'
            },
            {
                type: 'text',
                name: 'startCommand',
                value: selectedRepository?.startCommand,
                helperText: 'The command that us used to start your application. If you do not need to start your application, leave this field empty.',
                placeholder: '`yarn start`, `pnpm start`, `npm start`, or `bun start`'
            },
            {
                type: 'text',
                name: 'rootDirectory',
                value: selectedRepository?.rootDirectory,
                helperText: 'The directory that contains your project. If your project is in the root directory, leave this field empty.',
                placeholder: '`/`, `/src`, `/client`, or `/server`'
            }
        ]} />
};

export default SetupDeployment;