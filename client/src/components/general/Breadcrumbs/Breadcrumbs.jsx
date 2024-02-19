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
import { Breadcrumbs as MUIBreadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items, ...props }) => {
    const navigate = useNavigate();

    return (
        <div className='Breadcrumbs-Container' {...props}>
            <MUIBreadcrumbs separator='›'>
                {items.map((item, index) => (
                    <Link 
                        key={index} 
                        underline='hover' 
                        onClick={() => navigate(item.to)}
                    >{item.title}</Link>
                ))}
            </MUIBreadcrumbs>
        </div>
    );
};

export default Breadcrumbs;