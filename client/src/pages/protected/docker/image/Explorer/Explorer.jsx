import React from 'react';
import useUserDockerImages from '@hooks/api/user/useUserDockerImages';
import DocumentsExplorer from '@components/organisms/DocumentsExplorer';

const Explorer = () => {
    const { dockerImages, isLoading, error, stats, isOperationLoading, page, setPage } = useUserDockerImages();

    return <DocumentsExplorer
        title='Your Docker Images'
        documents={dockerImages}
        isLoading={isLoading}
        error={error}
        stats={stats}
        isOperationLoading={isOperationLoading}
        page={page}
        setPage={setPage}
        Render={({ name, tag, containers, createdAt, updatedAt }) => (
            <React.Fragment>
                <div className='Table-Row-Item'>{name}</div>
                <div className='Table-Row-Item'>{tag}</div>
                <div className='Table-Row-Item'>{containers.length}</div>
                <div className='Table-Row-Item'>{createdAt}</div>
                <div className='Table-Row-Item'>{updatedAt}</div>
            </React.Fragment>
        )}
        rowsTitles={[
            'Name',
            'Tag',
            'Containers',
            'Created At',
            'Updated At'
        ]}
    />
};

export default Explorer;