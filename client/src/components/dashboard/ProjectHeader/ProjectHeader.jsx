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
import './ProjectHeader.css';

const ProjectHeader = ({ repository }) => {
    return (
        <div className='Project-Header-Container'>
            <div className='Project-Image-Container'>
                <div className='Project-Image' />
            </div>
            <div className='Project-Title-Container'>
                <h3 className='Project-Title'>{repository.alias}</h3>
                <p className='Project-URL'>{repository.website || 'Website not defined.'}</p>
            </div>
        </div>
    );
};

export default ProjectHeader;