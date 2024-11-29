import React from 'react';
import useUserDockerNetworks from '@hooks/api/user/useUserDockerNetworks';
import DocumentsExplorer from '@components/organisms/DocumentsExplorer';

const Explorer = () => {
    const { dockerNetworks, isLoading, error, stats, isOperationLoading, page, setPage } = useUserDockerNetworks();

    return <DocumentsExplorer
        title='Your Docker Networks'
        documents={dockerNetworks}
        isLoading={isLoading}
        error={error}
        stats={stats}
        isOperationLoading={isOperationLoading}
        page={page}
        setPage={setPage}
        Render={({ name, containers, createdAt, updatedAt }) => (
            <React.Fragment>
                <div className='Table-Row-Item'>{name}</div>
                <div className='Table-Row-Item'>{containers.length}</div>
                <div className='Table-Row-Item'>{createdAt}</div>
                <div className='Table-Row-Item'>{updatedAt}</div>
            </React.Fragment>
        )}
        rowsTitles={[
            'Name',
            'Containers',
            'Created At',
            'Updated At'
        ]}
    />
};

export default Explorer;