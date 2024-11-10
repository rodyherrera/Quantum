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
import { useDispatch } from 'react-redux';
import Loader from '@components/atoms/Loader';
import CodeEditor from '@uiw/react-textarea-code-editor';
import FileExplorerHeader from '@components/molecules/FileExplorerHeader';
import FileExplorerContent from '@components/atoms/FileExplorerContent';
import './FileExplorer.css';

const FileExplorer = ({ 
    id, 
    files,
    isOperationLoading, 
    selectedFile, 
    updateSelectedFile,
    storageExplorer,
    updateOperation,
    readRepositoryFile
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();

    /**
     * Loads a directory or file based on the current path.
     * 
     * @param {string} path - The path of the file or directory to load.
     * @param {boolean} isDirectory - Whether the specified path points to a directory.
    */
    const loadPath = (path, isDirectory = true) => {
        setSearchParams({ path });
        if(isDirectory){
            return dispatch(storageExplorer(id, path));
        }
        dispatch(readRepositoryFile(id, path));
    };

    const getFileExtension = (filename) => {
        return filename.split('.').pop();
    };

    useEffect(() => {
        const path = searchParams.get('path') || '/';
        loadPath(path);
        gsap.fromTo('.Repository-Storage-Header-Title', {
            opacity: 0,
            scale: 0.95 
        }, { 
            scale: 1,
            duration: 0.8, 
            opacity: 1, 
            ease: 'power2.out' 
        });
        gsap.fromTo('.Repository-Storage-Header-Description', {
            opacity: 0,
            y: 20
        }, { 
            duration: 0.8, 
            opacity: 1, 
            y: 0,
            // Slight delay after the title
            delay: 0.2, 
            ease: 'power2.out' 
        });
        return () => {
            updateSelectedFile(null);
        };
    }, []);

    return isOperationLoading ? (
        <div className='File-Explorer-Loading-Container'>
            <Loader scale='0.7' />
        </div>
    ) : (
        <div className='File-Explorer-Body-Container'>
            <FileExplorerHeader 
                selectedFile={selectedFile} 
                updateOperation={updateOperation} 
                updateSelectedFile={updateSelectedFile}
                id={id} 
                loadPath={loadPath} />
            {selectedFile !== null ? (
                <div className='File-Explorer-Code-Block-Container'>
                    <CodeEditor
                        value={selectedFile.content}
                        onChange={(e) => updateSelectedFile({ name: selectedFile.name, content: e.target.value })}
                        padding={16}
                        style={{ 
                            backgroundColor: '#161616'
                        }}
                        showLineNumbers={false}
                        language={getFileExtension(selectedFile.name)}
                        text={selectedFile.content}
                    />
                </div>
            ) : (
                <FileExplorerContent files={files} loadPath={loadPath} />
            )}
        </div>
    )
};

export default FileExplorer;