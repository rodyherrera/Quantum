/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { useSearchParams } from 'react-router-dom';
import { storageExplorer, readRepositoryFile } from '@services/repository/operations';
import { setSelectedRepositoryFile } from '@services/repository/slice';
import { CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import CodeEditor from '@uiw/react-textarea-code-editor';
import FileExplorerHeader from '@components/repository/FileExplorerHeader';
import FileExplorerContent from '@components/repository/FileExplorerContent';
import './FileExplorer.css';

/**
 * FileExplorer component for repository file navigation and editing.
 * 
 * @param {string} repositoryId - ID of the repository associated with the file explorer.
*/
const FileExplorer = ({ repositoryId }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { isOperationLoading, selectedRepositoryFile } = useSelector((state) => state.repository);

    /**
     * Loads a directory or file based on the current path.
     * 
     * @param {string} path - The path of the file or directory to load.
     * @param {boolean} isDirectory - Whether the specified path points to a directory.
    */
    const loadPath = (path, isDirectory = true) => {
        setSearchParams({ path });
        if(isDirectory){
            return dispatch(storageExplorer(repositoryId, path));
        }
        dispatch(readRepositoryFile(repositoryId, path));
    };

    const getFileExtension = (filename) => {
        return filename.split('.').pop();
    };

    useEffect(() => {
        const path = searchParams.get('path') || '/';
        loadPath(path);
        gsap.from('#Repository-Storage-Header-Title', { 
            duration: 0.8, 
            opacity: 0, 
            scale: 0.95, 
            ease: 'power2.out' 
        });
        gsap.from('#Repository-Storage-Header-Description', { 
            duration: 0.8, 
            opacity: 0, 
            y: 20,
            // Slight delay after the title
            delay: 0.2, 
            ease: 'power2.out' 
        });
        return () => {
            dispatch(setSelectedRepositoryFile(null));
        };
    }, []);

    return isOperationLoading ? (
        <div className='File-Explorer-Loading-Container'>
            <CircularProgress className='Circular-Progress' />
        </div>
    ) : (
        <div className='File-Explorer-Body-Container'>
            <FileExplorerHeader repositoryId={repositoryId} loadPath={loadPath} />
            {selectedRepositoryFile !== null ? (
                <div className='File-Explorer-Code-Block-Container'>
                    <CodeEditor
                        value={selectedRepositoryFile.content}
                        onChange={(e) => dispatch(setSelectedRepositoryFile({ name: selectedRepositoryFile.name, content: e.target.value }))}
                        padding={16}
                        style={{ backgroundColor: '#161616' }}
                        showLineNumbers={false}
                        language={getFileExtension(selectedRepositoryFile.name)}
                        text={selectedRepositoryFile.content}
                    />
                </div>
            ) : (
                <FileExplorerContent loadPath={loadPath} />
            )}
        </div>
    )
};

export default FileExplorer;