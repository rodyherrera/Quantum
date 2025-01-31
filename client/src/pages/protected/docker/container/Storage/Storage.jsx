import React, { useEffect } from 'react';
import Storage from '@components/organisms/Storage';
import RelatedRepositorySections from '@components/molecules/RelatedRepositorySections';
import DockerContainerRelatedSections from '@components/molecules/DockerContainerRelatedSections';
import { setState } from '@services/docker/container/slice';
import { useSelector, useDispatch } from 'react-redux';
import { storageExplorer, readContainerFile, updateContainerFile } from '@services/docker/container/operations';
import { useDocumentTitle } from '@hooks/common';

const DockerContainerStorage = () => {
    const { 
        selectedDockerContainer,
        containerFiles,
        selectedContainerFile, 
        isOperationLoading } = useSelector((state) => state.dockerContainer);
    const dispatch = useDispatch();
    useDocumentTitle('Docker Container Storage');

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
        RightContainerComponent={selectedDockerContainer.isRepositoryContainer ? RelatedRepositorySections : DockerContainerRelatedSections}
        updateSelectedFile={updateSelectedFile}
        document={selectedDockerContainer}
        selectedFile={selectedContainerFile}
        title='File Explorer'
        description='You can modify the files that are available in "app/" within the Docker container.'
    />
};

export default DockerContainerStorage;