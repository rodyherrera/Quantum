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
import './HeaderBrand.css';

const HeaderBrand = () => {
    const navigate = useNavigate();

    return (
        <article className='Header-Brand-Container' onClick={() => navigate('/')}>
            <i className='Header-Brand-Logo'></i>
            <h1 className='Header-Brand-Title'>Quantum</h1>
        </article>
    );
};

export default HeaderBrand;