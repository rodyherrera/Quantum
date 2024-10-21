import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDate } from '@utilities/common/dateUtils';
import FileExplorer from '@components/molecules/FileExplorer';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import AnimatedMain from '@components/atoms/AnimatedMain';
import './Storage.css';

const Storage = ({ 
    name, 
    document, 
    updateOperation,
    updateSelectedFile,
    files,
    title,
    description, 
    selectedFile,
    isOperationLoading,
    readRepositoryFile,
    storageExplorer,
    RightContainerComponent
}) => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if(!document){
            return navigate('/dashboard');
        }
    }, []);

    return document && (
        <AnimatedMain className='Binary-View-Container Storage-Main'>
            <section className='Binary-View-Left-Container'>
                <Breadcrumbs 
                    items={[
                        { title: 'Home', to: '/' },
                        { title: 'Dashboard', to: '/dashboard/' },
                        { title: 'Repositories', to: '/dashboard/' },
                        { title: document.name, to: '/dashboard/' },
                        { title: 'File Explorer', to: `/repository/${document.name}/storage/` }
                    ]}
                />

                <article className='Storage-Header-Container'>
                    <div className='Storage-Header-Title-Container'>
                        <h1 className='Storage-Header-Title'>{title}</h1>
                        <p className='Storage-Header-Description'>{description}</p>
                    </div>
                </article>

                <article className='File-Explorer-Container'>
                    <div className='File-Explorer-Header-Container'>
                        <div className='File-Explorer-Header-Left-Container'>
                            <h3 className='File-Explorer-Header-Title'>{user.username}@{name}</h3>
                        </div>

                        <div className='File-Explorer-Header-Right-Container'>
                            <p className='File-Explorer-Repository-Id'>{document._id}</p>
                            <p className='File-Explorer-Created-At'>{formatDate(document.createdAt)}</p>
                        </div>
                    </div>

                    <FileExplorer 
                        files={files}
                        updateOperation={updateOperation}
                        storageExplorer={storageExplorer}
                        readRepositoryFile={readRepositoryFile}
                        isOperationLoading={isOperationLoading}
                        updateSelectedFile={updateSelectedFile}
                        selectedFile={selectedFile} 
                        id={document._id} />
                </article>
            </section>

            <section className='Binary-View-Right-Container'>
                {RightContainerComponent && (
                    <RightContainerComponent />
                )}
            </section>
        </AnimatedMain> 
    );
};

export default Storage;