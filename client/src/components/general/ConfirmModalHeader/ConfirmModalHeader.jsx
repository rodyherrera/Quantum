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

import React, { useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import { gsap } from 'gsap';
import './ConfirmModalHeader.css';

const ConfirmModalHeader = ({ title, highlightTitle, description, warning, hideConfirmModal }) => {
    const closeIconRef = useRef(null);

    const closeIconClickHandler = () => {
        gsap.to(closeIconRef.current, {
            rotation: 360,
            duration: 0.5,
            ease: 'back.out',
            onComplete: hideConfirmModal
        });
    };

    return (
        <div className='Confirm-Modal-Header-Container'>
            <div className='Confirm-Modal-Header-Title-Container'>
                <h3 className='Confirm-Modal-Header-Title'>
                    <span className='Confirm-Modal-Title-Hightlight'>{highlightTitle}</span> {title}
                </h3>
                <i className='Confirm-Modal-Header-Icon-Container' ref={closeIconRef} onClick={closeIconClickHandler}>
                    <IoMdClose />
                </i>
            </div>
            <p className='Confirm-Modal-Header-Description'>{description}</p>
            <div className='Confirm-Modal-Warning-Container'>
                <span className='Confirm-Modal-Warning-Title'>Warning:</span>
                <span className='Confirm-Modal-Warning-Content'>{warning}</span>
            </div>
        </div>
    );
};

export default ConfirmModalHeader;