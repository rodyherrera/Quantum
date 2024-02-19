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
import './HamburguerMenu.css';

const HamburguerMenu = (props) => (
    <div className='Hamburguer-Icon-Container'>
        <label className='Toggle'>
            <input
                readOnly={true}
                checked={props.isactive === 'true'} 
                type='checkbox' {...props} />
            <div>
                <div>
                    <span></span>
                    <span></span>
                </div>
                <svg>
                    <use xlinkHref="#Hamburguer-Icon-Path" />
                </svg>
                <svg>
                    <use xlinkHref="#Hamburguer-Icon-Path" />
                </svg>
            </div>
        </label>
                
        <svg xmlns='http://www.w3.org/2000/svg' style={{ display: 'none' }}>
            <symbol xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44' id='Hamburguer-Icon-Path'>
                <path d='M22,22 L2,22 C2,11 11,2 22,2 C33,2 42,11 42,22'></path>
            </symbol>
        </svg>
    </div>
);

export default HamburguerMenu;