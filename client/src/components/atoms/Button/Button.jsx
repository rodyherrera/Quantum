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

import React, { forwardRef } from 'react';
import { CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import './Button.css';

const Button = forwardRef(({ 
    title, 
    icon = null, 
    to = null, 
    variant = null, 
    isLoading = null,
    ...props 
}, ref) => {
    const navigate = useNavigate();

    const handleOnClick = () => {
        props?.onClick?.();
        if(!to) return;
        const startsWithHTTP = to.startsWith('http');
        if(startsWithHTTP){
            window.open(to);
            return;
        }
        navigate(to);
    };

    return (
        <button 
            {...props}
            ref={ref}
            className={`Button ${variant ? ` ${variant}` : ''}`}
            onClick={handleOnClick}
        >
            {isLoading && (
                <CircularProgress className='Button-Circular-Progress' />
            )}
            <span className='Button-Text'>{title}</span>
            {icon && <i className='Button-Icon'>{icon}</i>}
        </button>
    );
});

export default Button;