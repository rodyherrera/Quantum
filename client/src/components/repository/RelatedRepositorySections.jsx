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

import React from 'react';
import RelatedItems from '@components/general/RelatedItems';
import { CiServer } from 'react-icons/ci';
import { IoIosGitBranch } from 'react-icons/io';
import { GoTerminal } from 'react-icons/go';
import { GrDeploy } from 'react-icons/gr';
import { VscGitPullRequestCreate } from 'react-icons/vsc';
import { MdDataObject } from 'react-icons/md';
import { RxDashboard } from 'react-icons/rx';
import { useSelector } from 'react-redux';

const RelatedRepositorySections = ({ isRepositorySelected = true }) => {
    const { selectedRepository } = useSelector((state) => state.repository);

    const unselectedRepositoryItems = [
        {
            title: 'Create a new repository',
            description: 'Create, host and deploy a new repository within the platform.',
            icon: VscGitPullRequestCreate,
            to: '/repository/create/'
        },
        {
            title: 'Dashboard',
            description: 'Manage the list of repositories deployed on the platform.',
            icon: RxDashboard,
            to: '/dashboard/'
        }
    ];

    const selectedRepositoryItems = [
        { 
            title: 'File Explorer', 
            description: 'Explore and manage your files and folders directly from the browser.',
            icon: CiServer,
            to: `/repository/${encodeURIComponent(selectedRepository?.alias)}/storage/`
        },
        { 
            title: 'Repository CLI', 
            icon: GoTerminal,
            description: 'Access and manage your GitHub repositories using a command line interface (CLI).',
            to: `/repository/${encodeURIComponent(selectedRepository?.alias)}/shell/`
        },
        { 
            title: 'Environment Variables', 
            icon: MdDataObject,
            description: "Manage your application's environment variables, such as API keys and environment-specific settings.",
            to: `/repository/${encodeURIComponent(selectedRepository?.alias)}/deployment/environment-variables/`
        },
        {
            title: 'Build & Dev Settings',
            icon: GrDeploy,
            description: 'Customize your repository deployment settings, including installation, start, and build commands, among other configurations.',
            to: `/repository/${encodeURIComponent(selectedRepository?.alias)}/deployment/setup/`
        },
        { 
            title: 'Deployments', 
            icon: IoIosGitBranch,
            description: 'Get a list of all the deployments that currently exist in your repository.',
            to: `/repository/${encodeURIComponent(selectedRepository?.alias)}/deployments/`
        }
    ];

    const itemsToDisplay = isRepositorySelected
        ? [...selectedRepositoryItems, ...unselectedRepositoryItems]
        : unselectedRepositoryItems;

    return <RelatedItems items={itemsToDisplay} />
};

export default RelatedRepositorySections;