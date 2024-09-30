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
import { useDispatch } from 'react-redux';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { setState as coreSetState } from '@services/core/slice';
import './MenuItem.css';

const MenuItem = ({ icon, title, to }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const clickHandler = (link) => {
        if(link.startsWith('http')) window.open(link, '_blank')
        else navigate(link);
        dispatch(coreSetState({ path: 'isMenuEnabled', value: false }));
    };

    return (
        <li className='Menu-Item-Container' onClick={() => clickHandler(to)}>
            <div className='Menu-Item-Left-Container'>
                <i className='Menu-Item-Icon-Container'>
                    {icon}
                </i>
                <h3 className='Menu-Item-Title'>{title}</h3>
            </div>

            <div className='Menu-Item-Right-Container'>
                <i className='Menu-Item-Arrow-Icon-Container'>
                    <FaLongArrowAltRight />
                </i>
            </div>
        </li>
    );
};

export default MenuItem;