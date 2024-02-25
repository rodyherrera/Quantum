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
import { IoIosArrowForward } from 'react-icons/io';
import './ConfirmModalFooter.css';

const ConfirmModalFooter = ({ 
    hideConfirmModal, 
    isContinueBtnDisabled, 
    handleContinueBtn,
    confirmButtonRef
}) => {
    return (
        <div className='Confirm-Modal-Footer-Container'>
            <button className='Confirm-Modal-Option-Container Text' onClick={() => hideConfirmModal()}>
                <span className='Confirm-Modal-Option-Title'>Cancel</span>
            </button>

            <button 
                className='Confirm-Modal-Option-Container Contained' 
                disabled={isContinueBtnDisabled}
                onClick={handleContinueBtn}
                ref={confirmButtonRef}
            >
                <span className='Confirm-Modal-Option-Title'>Confirm</span>
                <i className='Confirm-Modal-Option-Icon-Container'>
                    <IoIosArrowForward />
                </i>
            </button>
        </div>
    );
};

export default ConfirmModalFooter;