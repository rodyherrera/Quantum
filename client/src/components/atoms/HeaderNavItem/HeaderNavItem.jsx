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
import './HeaderNavItem.css';

const HeaderNavItem = ({ title, to, children, ...props }) => {
    const navigate = useNavigate();
    
    const clickHandler = () => {
        if(props?.onClick) props.onClick();
        if(!to) return;
        navigate(to);
    };

    return (
        <div 
            {...props}
            className={'Header-Navigation-Item-Container ' + props?.className || ''}
            onClick={clickHandler}
        >
            {(title) && (
                <h3 className='Header-Navigation-Item-Title'>{title}</h3>
            )}
            
            {(children) && (children)}
        </div>
    );
};

export default HeaderNavItem;