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
import { MdDataObject } from 'react-icons/md';
import { SiGithubactions } from 'react-icons/si';
import { useSelector } from 'react-redux';

const RelatedRepositorySections = () => {
    const { selectedRepository } = useSelector((state) => state.repository);

    const items = [
        { 
            title: 'File Explorer', 
            description: 'Explore and manage your files and folders directly from the browser.',
            icon: CiServer,
            to: `/repository/${encodeURIComponent(selectedRepository.alias)}/storage/`
        },
        { 
            title: 'Repository CLI', 
            icon: GoTerminal,
            description: 'Access and manage your GitHub repositories using a command line interface (CLI).',
            to: `/repository/${encodeURIComponent(selectedRepository.alias)}/shell/`
        },
        { 
            title: 'Environment Variables', 
            icon: MdDataObject,
            description: "Manage your application's environment variables, such as API keys and environment-specific settings.",
            to: `/repository/${encodeURIComponent(selectedRepository.alias)}/deployment/environment-variables/`
        },
        {
            title: 'Build & Dev Settings',
            icon: GrDeploy,
            description: 'Customize your repository deployment settings, including installation, start, and build commands, among other configurations.',
            to: `/repository/${encodeURIComponent(selectedRepository.alias)}/deployment/setup/`
        },
        { 
            title: 'Deployments', 
            icon: IoIosGitBranch,
            description: 'Get a list of all the deployments that currently exist in your repository.',
            to: `/repository/${encodeURIComponent(selectedRepository.alias)}/deployments/`
        },
        {
            title: 'New Repository',
            icon: SiGithubactions,
            description: 'Deploy and configure a new repository within Quantum.',
            to: `/repository/create`
        }
    ];
    
    return <RelatedItems items={items} />
};

export default RelatedRepositorySections;