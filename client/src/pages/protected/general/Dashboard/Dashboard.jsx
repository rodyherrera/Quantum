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
import {
    DockerContainers, 
    DockerImages, 
    DockerNetworks, 
    Repositories, 
    PortBindings } from '@components/molecules/DataRenderer';
import { useDocumentTitle } from '@hooks/common';
import UserStickyFooterStats from '@components/molecules/UserStickyFooterStats';
import OneClickDeploys from '@components/molecules/OneClickDeploys';
import './Dashboard.css';

const Dashboard = () => {
    useDocumentTitle('Dashboard');

    return (
        <main id='Dashboard-Page'>
            <section className='Dashboard-Header-Container'>
                <OneClickDeploys />
            </section>
            <section className='Dashboard-Modules-Container'>
                <Repositories />
                <DockerContainers />
                <DockerNetworks />
                <DockerImages />
                <PortBindings />
            </section>
            <UserStickyFooterStats />
        </main>
    );
};

export default Dashboard;