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
import './Input.css';

const Input = ({ helperText, endIcon = null, ...props }) => {

    return (
        <div className='Input-Container'>
            <div className='Input-Wrapper-Container'>
                <input className='Input' {...props} />
                {(endIcon) && (
                    <i className='Input-End-Icon-Container' {...endIcon.props}>
                        {endIcon.render}
                    </i>
                )}
            </div> 
            <div className='Input-Helper-Text-Container'>
                <p className='Input-Helper-Text'>{helperText}</p>
            </div>
        </div>
    );
};

export default Input;