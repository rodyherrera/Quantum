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
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDate } from '@utilities/runtime';
import FileExplorer from '@components/repository/FileExplorer';
import Breadcrumbs from '@components/general/Breadcrumbs';
import AnimatedMain from '@components/general/AnimatedMain';
import RelatedRepositorySections from '@components/repository/RelatedRepositorySections';
import './Storage.css';

const Storage = () => {
    const { repositoryAlias } = useParams();
    const { user } = useSelector((state) => state.auth);
    const { selectedRepository } = useSelector((state) => state.repository);
    const navigate = useNavigate();

    useEffect(() => {
        if(!selectedRepository) 
            return navigate('/dashboard/');
    }, []);

    return selectedRepository && (
        <AnimatedMain id='Repository-Storage-Main' className='Binary-View-Container'>
            <section className='Binary-View-Left-Container'>
                <Breadcrumbs 
                    items={[
                        { title: 'Home', to: '/' },
                        { title: 'Dashboard', to: '/dashboard/' },
                        { title: 'Repositories', to: '/dashboard/' },
                        { title: selectedRepository.name, to: '/dashboard/' },
                        { title: 'File Explorer', to: `/repository/${selectedRepository.name}/storage/` }
                    ]}
                />

                <article id='Repository-Storage-Header-Container'>
                    <div id='Repository-Storage-Header-Title-Container'>
                        <h1 id='Repository-Storage-Header-Title'>File Explorer</h1>
                        <p id='Repository-Storage-Header-Description'>You can make changes to the repository files without having to commit within Github, however, when a commit occurs, the files will be overwritten with the repository information in Github, so your changes made locally will be lost.</p>
                    </div>
                </article>

                <article className='File-Explorer-Container'>
                    <div className='File-Explorer-Header-Container'>
                        <div className='File-Explorer-Header-Left-Container'>
                            <h3 className='File-Explorer-Header-Title'>{user.username}@{repositoryAlias}</h3>
                        </div>

                        <div className='File-Explorer-Header-Right-Container'>
                            <p className='File-Explorer-Repository-Id'>{selectedRepository._id}</p>
                            <p className='File-Explorer-Created-At'>{formatDate(selectedRepository.createdAt)}</p>
                        </div>
                    </div>

                    <FileExplorer repositoryId={selectedRepository._id} />
                </article>
            </section>

            <section className='Binary-View-Right-Container'>
                <RelatedRepositorySections />
            </section>
        </AnimatedMain>
    );
};

export default Storage;