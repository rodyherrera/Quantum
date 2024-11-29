import React from 'react';
import useUserPortBindings from '@hooks/api/user/useUserPortBinding';
import DocumentsExplorer from '@components/organisms/DocumentsExplorer';

const Explorer = () => {
    const { portBindings, isLoading, error, stats, isOperationLoading, page, setPage } = useUserPortBindings();

    return <DocumentsExplorer
        title='Your Port Bindings'
        documents={portBindings}
        isLoading={isLoading}
        error={error}
        stats={stats}
        isOperationLoading={isOperationLoading}
        page={page}
        setPage={setPage}
        Render={({ externalPort, internalPort, container, protocol, createdAt, updatedAt, _id }) => (
            <React.Fragment>
                <div className='Table-Row-Item'>{externalPort}</div>
                <div className='Table-Row-Item'>{internalPort}</div>
                <div className='Table-Row-Item'>{container.name}</div>
                <div className='Table-Row-Item'>{protocol}</div>
                <div className='Table-Row-Item'>{createdAt}</div>
                <div className='Table-Row-Item'>{updatedAt}</div>
                <div className='Table-Row-Item'>{_id}</div>
            </React.Fragment>
        )}
        rowsTitles={[
            'External Port',
            'Internal Port',
            'Container',
            'Protocol',
            'Created At',
            'Updated At',
            'ID'
        ]}
    />
};

export default Explorer;