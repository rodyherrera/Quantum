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
import { useNavigate } from 'react-router-dom';
import './IconLink.css';

const IconLink = ({ title, icon, to = null, ...props }) => {
    const navigate = useNavigate();

    const handleOnClick = () => {
        if(props?.onClick) props?.onClick();
        if(to){
            if(to.startsWith('http')) window.open(to, '_blank');
            else navigate(to);
        }
    };

    return (
        <div className='Icon-Link-Container' {...props} onClick={handleOnClick}>
            <span className='Icon-Link-Title'>{title}</span>
            {(icon) && (
                <i className='Icon-Link-Icon-Container'>
                    {icon}
                </i>
            )}
        </div>
    );
};

export default IconLink;