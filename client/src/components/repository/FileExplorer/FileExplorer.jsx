import React, { useEffect } from 'react';
import { CiFileOn } from 'react-icons/ci';
import { GoFileDirectory } from 'react-icons/go';
import { useSearchParams } from 'react-router-dom';
import  { storageExplorer } from '@services/repository/actions';
import { CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import './FileExplorer.css';

const FileExplorer = () => {
    const { isOperationLoading, repositoryFiles } = useSelector((state) => state.repository);
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();

    const loadDirectory = (directory) => {
        setSearchParams({ path: directory });
        dispatch(storageExplorer('65b72c5347c55ca7be279fb2', directory));
    };
    
    const repositoryClickHandler = ({ name, isDirectory }) => {
        const currentPath = searchParams.get('path') || '';
        const newPath = currentPath.endsWith('/') ? currentPath + name : currentPath + '/' + name;
        if(isDirectory){
            loadDirectory(newPath);
        }
    };

    const goBackHandler = () => {
        const currentPath = searchParams.get('path') || '';
        const newPath = currentPath.split('/').slice(0, -1).join('/');
        loadDirectory(newPath || '/');
    };

    useEffect(() => {
        loadDirectory(searchParams.get('path') || '/');
    }, []);

    return (
        isOperationLoading ? (
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
                {repositoryFiles.map(({ name, isDirectory }, index) => (
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
                ))}
            </div>
        )
    );
};

export default FileExplorer;