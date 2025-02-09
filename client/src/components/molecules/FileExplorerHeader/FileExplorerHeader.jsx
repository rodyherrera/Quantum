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

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '@components/atoms/Button';
import './FileExplorerHeader.css';

const FileExplorerHeader = ({ id, updateSelectedFile, loadPath, selectedFile, updateOperation }) => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    // Handles overwriting the current file.
    const overwriteFileHandler = () => {
        const { content } = selectedFile;
        const path = searchParams.get('path');
        dispatch(updateOperation(id, path, content));
        goBackHandler();
    };

    // Handles navigation to the parent directory.
    const goBackHandler = () => {
        if(selectedFile !== null) updateSelectedFile(null);
        const currentPath = searchParams.get('path');
        const newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        loadPath(newPath);
    };

    return (
        searchParams.get('path') !== '/' && (
            <div className='File-Explorer-Actions-Container'>
                <div className='File-Explorer-Go-Back-Container' onClick={goBackHandler}>
                    <span className='File-Explorer-Go-Back-Text'>...</span>
                </div>
                {selectedFile !== null && (
                    <div className='File-Explorer-Header-Right-Container'>
                        <Button 
                            onClick={overwriteFileHandler}
                            title='Save Changes & Exit'
                            variant='Small Contained Extended-Sides'
                        />
                    </div>
                )}
            </div>
        )
    );
};

export default FileExplorerHeader;