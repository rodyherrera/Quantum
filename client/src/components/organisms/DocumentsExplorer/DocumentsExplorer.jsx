import React from 'react';
import { GoArrowDownLeft } from 'react-icons/go';
import { Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Loader from '@components/atoms/Loader';
import './DocumentsExplorer.css';

const DocumentsExplorer = ({
    title,
    documents,
    isLoading,
    error,
    stats,
    isOperationLoading,
    page,
    setPage,
    Render,
    rowsTitles
}) => {
    const navigate = useNavigate();

    return (
        <main className='Documents-Explorer-Main'>
            <section className='Documents-Sidebar-Container'>
                <article className='Documents-Sidebar-Top-Container' onClick={() => navigate(-1)}>
                    <article className='Documents-Sidebar-Header-Container'>
                        <i className='Documents-Sidebar-Header-Back-Icon-Container'>
                            <GoArrowDownLeft />
                        </i>
                        <h3 className='Documents-Sidebar-Header-Title'>{title}</h3>
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
                    {rowsTitles.map((title, index) => (
                        <div className='Table-Row-Item' key={index}>{title}</div>
                    ))}
                </article>
                <article className='Table-Body-Container'>
                    {documents.map((fields, index) => (
                        <article className='Table-Row-Container' key={index}>
                            <Render {...fields} />
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