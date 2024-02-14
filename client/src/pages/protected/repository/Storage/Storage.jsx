import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDate } from '@utilities/runtime';
import FileExplorer from '@components/repository/FileExplorer';
import Breadcrumbs from '@components/general/Breadcrumbs';
import AnimatedMain from '@components/general/AnimatedMain';
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
        <AnimatedMain id='Repository-Storage-Main'>
            <Breadcrumbs 
                items={[
                    { title: 'Home', to: '/' },
                    { title: 'Dashboard', to: '/dashboard/' },
                    { title: 'Repositories', to: '/dashboard/' },
                    { title: selectedRepository.name, to: '/dashboard/' },
                    { title: 'File Explorer', to: `/repository/${selectedRepository.name}/storage/` }
                ]}
            />

            <section id='Repository-Storage-Header-Container'>
                <article id='Repository-Storage-Header-Title-Container'>
                    <h1 id='Repository-Storage-Header-Title'>File Explorer</h1>
                    <p id='Repository-Storage-Header-Description'>You can make changes to the repository files without having to commit within Github, however, when a commit occurs, the files will be overwritten with the repository information in Github, so your changes made locally will be lost.</p>
                </article>
            </section>

            <div className='File-Explorer-Container'>
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
            </div>
        </AnimatedMain>
    );
};

export default Storage;