import React from 'react';
import Storage from '@components/organisms/Storage';
import RelatedRepositorySections from '@components/molecules/RelatedRepositorySections';
import { useParams } from 'react-router-dom';
import { setState } from '@services/repository/slice';
import { useDispatch, useSelector } from 'react-redux';
import { storageExplorer, readRepositoryFile, updateRepositoryFile } from '@services/repository/operations';

const RepositoryStorage = () => {
    const { repositoryAlias } = useParams();
    const { 
        selectedRepository, 
        repositoryFiles,
        selectedRepositoryFile, 
        isOperationLoading } = useSelector((state) => state.repository);
    const dispatch = useDispatch();

    const updateSelectedFile = (value) => {
        dispatch(setState({ path: 'selectedRepositoryFile', value }));
    };

    return <Storage 
        files={repositoryFiles}
        name={repositoryAlias}
        storageExplorer={storageExplorer}
        readRepositoryFile={readRepositoryFile}
        isOperationLoading={isOperationLoading}
        updateOperation={updateRepositoryFile}
        updateSelectedFile={updateSelectedFile}
        document={selectedRepository}
        selectedFile={selectedRepositoryFile}
        title='File Explorer'
        description='You can make changes to the repository files without having to commit within Github, however, when a commit occurs, the files will be overwritten with the repository information in Github, so your changes made locally will be lost.'
        RightContainerComponent={RelatedRepositorySections}
    />
};

export default RepositoryStorage;