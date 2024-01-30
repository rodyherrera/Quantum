import React, { useEffect } from 'react';
import { CiFileOn } from 'react-icons/ci';
import { CodeBlock, dracula } from 'react-code-blocks';
import { GoFileDirectory } from 'react-icons/go';
import { useSearchParams } from 'react-router-dom';
import { storageExplorer, readRepositoryFile } from '@services/repository/actions';
import { setSelectedRepositoryFile } from '@services/repository/slice';
import { CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import './FileExplorer.css';

const FileExplorer = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();

    const {
        isOperationLoading,
        repositoryFiles,
        selectedRepositoryFile
    } = useSelector((state) => state.repository);

    const loadPath = (path, isDirectory = true) => {
        setSearchParams({ path });
        if(isDirectory){
            return dispatch(storageExplorer('65b72c5347c55ca7be279fb2', path));
        }
        dispatch(readRepositoryFile('65b72c5347c55ca7be279fb2', path));
    };

    const repositoryClickHandler = ({ name, isDirectory }) => {
        const currentPath = searchParams.get('path') || '';
        const path = currentPath.endsWith('/') ? currentPath + name : currentPath + '/' + name;
        loadPath(path, isDirectory);
    };

    const goBackHandler = () => {
        if(selectedRepositoryFile !== null) dispatch(setSelectedRepositoryFile(null));
        const currentPath = searchParams.get('path');
        const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        loadPath(newPath);
    };

    const getFileExtension = (filename) => filename.split('.').pop();

    useEffect(() => {
        const path = searchParams.get('path') || '/';
        loadPath(path);
    }, []);

    return isOperationLoading ? (
        <div className='File-Explorer-Loading-Container'>
            <CircularProgress className='Circular-Progress' />
        </div>
    ) : (
        <div className='File-Explorer-Body-Container'>
            {searchParams.get('path') !== '/' && (
                <div className='File-Explorer-Go-Back-Container' onClick={goBackHandler}>
                    <span className='File-Explorer-Go-Back-Text'>...</span>
                </div>
            )}
            {selectedRepositoryFile !== null ? (
                <div className='File-Explorer-Code-Block-Container'>
                    <CodeBlock
                        theme={dracula}
                        showLineNumbers={false}
                        language={getFileExtension(selectedRepositoryFile.name)}
                        text={selectedRepositoryFile.content}
                    />
                </div>
            ) : (
                repositoryFiles.map(({ name, isDirectory }, index) => (
                    <div
                        onClick={() => repositoryClickHandler({ name, isDirectory })}
                        className='File-Explorer-File-Container'
                        key={index}
                    >
                        <i className='File-Explorer-File-Icon-Container'>
                            {isDirectory ? <GoFileDirectory /> : <CiFileOn />}
                        </i>
                        <span className='File-Explorer-File-Name'>{name}</span>
                    </div>
                ))
            )}
        </div>
    )
};

export default FileExplorer;