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
import './ContextMenuOption.css';

const ContextMenuOption = ({ onClick, title, ...props }) => {
    return (
        <React.Fragment>
            <li 
                className='Context-Menu-Option' 
                onClick={onClick}
                {...props}
            >
                <span className='Context-Menu-Option-Title'>{title}</span>
            </li>
        </React.Fragment>
    );
};

export default ContextMenuOption;