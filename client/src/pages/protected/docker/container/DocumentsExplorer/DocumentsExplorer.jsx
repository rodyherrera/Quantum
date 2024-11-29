import React from 'react';
import { GoArrowDownLeft } from 'react-icons/go';
import { Pagination } from '@mui/material';
import Loader from '@components/atoms/Loader';
import useUserDockerContainers from '@hooks/api/user/useUserDockerContainers';
import './DocumentsExplorer.css';

const DocumentsExplorer = () => {
    const { dockerContainers, isLoading, error, stats, isOperationLoading, page, setPage } = useUserDockerContainers();

    return (
        <main className='Documents-Explorer-Main'>
            <section className='Documents-Sidebar-Container'>
                <article className='Documents-Sidebar-Top-Container'>
                    <article className='Documents-Sidebar-Header-Container'>
                        <i className='Documents-Sidebar-Header-Back-Icon-Container'>
                            <GoArrowDownLeft />
                        </i>
                        <h3 className='Documents-Sidebar-Header-Title'>Your Docker Containers</h3>
                    </article>
                </article>

                <article className='Documents-Sidebar-Bottom-Container'>
                    <h3 className='Documents-Total-Results'>Consulting between <span className='Highlight-Text'>{stats?.results?.total || '...'} documents!</span></h3>
                </article>
            </section>

            <section className='Documents-Container'>
                {isLoading && (
                    <div className='Documents-Loader-Container'>
                        <Loader scale='0.7' />
                    </div>
                )}

                <article className='Table-Row-Container Table-Header-Container'>
                    {[
                        'Name',
                        'Image',
                        'Status',
                        'IP Address',
                        'Port Bindings',
                        'Created At',
                        'Updated At'
                    ].map((title, index) => (
                        <div className='Table-Row-Item' key={index}>{title}</div>
                    ))}
                </article>
                <article className='Table-Body-Container'>
                    {dockerContainers.map(({ name, image, status, portBindings, ipAddress, createdAt, updatedAt, network }, index) => (
                        <article className='Table-Row-Container' key={index}>
                            <div className='Table-Row-Item'>{name}</div>
                            <div className='Table-Row-Item'>{image.name}:{image.tag}</div>
                            <div className='Table-Row-Item'>{status}</div>
                            <div className='Table-Row-Item'>{ipAddress}</div>
                            <div className='Table-Row-Item'>{portBindings.length}</div>
                            <div className='Table-Row-Item'>{createdAt}</div>
                            <div className='Table-Row-Item'>{updatedAt}</div>
                        </article>
                    ))}
                </article>
                <article className='Table-Footer-Container'>
                    <Pagination 
                        size='small'
                        shape='rounded'
                        onChange={(_, value) => setPage(value)}
                        page={page}
                        count={stats?.page?.total} />
                </article>
            </section>
        </main>
    );
};

export default DocumentsExplorer;