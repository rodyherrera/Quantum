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
import ProjectHeader from '@components/dashboard/ProjectHeader';
import ProjectActions from '@components/dashboard/ProjectActions';
import ProjectFooter from '@components/dashboard/ProjectFooter';
import './Project.css';

const Project = ({ repository, ...props }) => {
    const onClickHandler = (e) => {
        if(
            e.target.classList.contains('Context-Menu-Container') || 
            e.target.classList.contains('Context-Menu-Option')
        ){
            return;
        }
        props?.onClick?.();
    };

    return (
        <div className='Project-Container' {...props} onClick={onClickHandler}>
            <ProjectActions repository={repository} />
            <ProjectHeader repository={repository} />
            <div className='Project-Body-Container'>
                <div className='Project-Description-Container'>
                    <p className='Project-Description'>{repository.latestCommitMessage}</p>
                </div>
            </div>
            <ProjectFooter repository={repository} />
        </div>
    );
};

export default Project;