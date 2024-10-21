import React from 'react';
import Storage from '@components/organisms/Storage';
import { setState } from '@services/docker/container/slice';
import { useSelector, useDispatch } from 'react-redux';
import { storageExplorer, readContainerFile, updateContainerFile } from '@services/docker/container/operations';

const RepositoryStorage = () => {
    const { 
        selectedDockerContainer,
        containerFiles,
        selectedContainerFile, 
        isOperationLoading } = useSelector((state) => state.dockerContainer);
    const dispatch = useDispatch();

    const updateSelectedFile = (value) => {
        dispatch(setState({ path: 'selectedContainerFile', value }));
    };

    return <Storage 
        storageExplorer={storageExplorer}
        readRepositoryFile={readContainerFile}
        files={containerFiles}
        name={selectedDockerContainer?.name}
        updateOperation={updateContainerFile}
        isOperationLoading={isOperationLoading}
        updateSelectedFile={updateSelectedFile}
        document={selectedDockerContainer}
        selectedFile={selectedContainerFile}
        title='File Explorer'
        description='You can modify the files that are available in "app/" within the Docker container.'
    />
};

export default RepositoryStorage;