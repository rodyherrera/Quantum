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
import { DockerContainers, DockerImages, DockerNetworks, Repositories } from '@components/molecules/DataRenderer';
import './Dashboard.css';


const Dashboard = () => {
    return (
        <main id='Dashboard-Page'>
            <section className='Dashboard-Modules-Container'>
                <Repositories />
                <DockerContainers />
                <DockerNetworks />
                <DockerImages />
            </section>
        </main>
    );
};

export default Dashboard;