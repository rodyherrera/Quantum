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

import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWindowSize, useDocumentTitle } from '@hooks/common/';
import { useRemoteTerminal } from '@hooks/ws/';
import Loader from '@components/atoms/Loader';
import RelatedRepositorySections from '@components/molecules/RelatedRepositorySections';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import AnimatedMain from '@components/atoms/AnimatedMain'
import './Shell.css';

const Shell = () => {
    const termContainerRef = useRef(null);
    const { width } = useWindowSize();
    const { repositoryAlias } = useParams();
    const { isConnected, fitAddonRef } = useRemoteTerminal({ 
        termContainerRef, query: { repositoryAlias, action: 'Repository::Shell' } });
    useDocumentTitle('Repository Shell');

    useEffect(() => {
        if(!fitAddonRef.current) return;
        fitAddonRef.current.fit();
    }, [width]);

    return (
        <AnimatedMain id='Repository-Shell-Main' className='Binary-View-Container'>
            <section className='Binary-View-Left-Container'>
                <article id='Repository-Shell-Header-Container'>
                    <Breadcrumbs
                        items={[
                            { title: 'Home', to: '/' },
                            { title: 'Dashboard', to: '/dashboard/' },
                            { title: 'Repositories', to: '/dashboard/' },
                            { title: repositoryAlias, to: '/dashboard/' },
                            { title: 'Shell', to: `/repository/${repositoryAlias}/shell/` }
                        ]}
                    />
                    <div id='Repository-Shell-Title-Container'>
                        <h1 id='Repository-Shell-Title'>Advanced repository management</h1>
                        <p id='Repository-Shell-Subtitle'>Interact with the root of your repository through the command line. <br /> A connection with the server will be initiated to manage communication.</p>
                    </div>
                </article>

                <article id='Repository-Shell-Body-Container'>
                    <div id='Repository-Shell'>
                        {(!isConnected) && (
                            <aside id='Socket-Connection-Loading-Container'>
                                <Loader scale='0.7' />
                            </aside>
                        )}

                        <div className='Terminal-Container' ref={termContainerRef} />
                    </div>
                </article>
            </section>

            <section className='Binary-View-Right-Container'>
                <RelatedRepositorySections />
            </section>
        </AnimatedMain>
    );
};

export default Shell;