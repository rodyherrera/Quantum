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
import { useSearchParams } from 'react-router-dom';
import { CiFileOn } from 'react-icons/ci';
import { gsap } from 'gsap';
import { GoFileDirectory } from 'react-icons/go';
import './FileExplorerContent.css';

const FileExplorerContent = ({ loadPath, files }) => {
    const [searchParams] = useSearchParams();

    /** 
     * Handles navigation to a file or directory. 
     * @param {object} repositoryEntry - Object with 'name' and 'isDirectory' properties.
    */
    const repositoryClickHandler = ({ name, isDirectory }) => {
        const currentPath = searchParams.get('path') || '';
        const updatedPath = currentPath.endsWith('/')
            ? currentPath + name
            : currentPath + '/' + name;
        loadPath(updatedPath, isDirectory);
    };

    useEffect(() => {
        if(!files.length) return;
        gsap.fromTo('.File-Explorer-File-Container', {
            opacity: 0
        }, { 
            duration: 0.2, 
            opacity: 1,
            // Add a slight delay between each item's animation
            stagger: 0.1,
            ease: 'power2.out' 
        });
    }, [files]);
        
    return (
        files.map(({ name, isDirectory }, index) => (
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
    );
};

export default FileExplorerContent;