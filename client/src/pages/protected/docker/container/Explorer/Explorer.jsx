import React from 'react';
import useUserDockerContainers from '@hooks/api/user/useUserDockerContainers';
import DocumentsExplorer from '@components/organisms/DocumentsExplorer';

const Explorer = () => {
    const { dockerContainers, isLoading, error, stats, isOperationLoading, page, setPage } = useUserDockerContainers();

    return <DocumentsExplorer
        title='Your Docker Containers'
        documents={dockerContainers}
        isLoading={isLoading}
        error={error}
        stats={stats}
        isOperationLoading={isOperationLoading}
        page={page}
        setPage={setPage}
        Render={({ name, image, status, ipAddress, portBindings, createdAt, updatedAt }) => (
            <React.Fragment>
                <div className='Table-Row-Item'>{name}</div>
                <div className='Table-Row-Item'>{image.name + ':' + image.tag}</div>
                <div className='Table-Row-Item'>{status}</div>
                <div className='Table-Row-Item'>{ipAddress}</div>
                <div className='Table-Row-Item'>{portBindings.length}</div>
                <div className='Table-Row-Item'>{createdAt}</div>
                <div className='Table-Row-Item'>{updatedAt}</div>
            </React.Fragment>
        )}
        rowsTitles={[
            'Name',
            'Image',
            'Status',
            'IP Address',
            'Port Bindings',
            'Created At',
            'Updated At'
        ]}
    />
};

export default Explorer;