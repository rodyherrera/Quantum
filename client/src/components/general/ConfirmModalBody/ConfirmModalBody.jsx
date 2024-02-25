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

import React, { useState } from 'react';
import Input from  '@components/general/Input';
import './ConfirmModalBody.css';
import { useEffect } from 'react';

const ConfirmModalBody = ({ 
    firstInputRender, 
    lastInputRender,
    lastInputMatch,
    firstInputMatch,
    setIsContinueBtnDisabled
}) => {
    const [firstInputValue, setFirstInputValue] = useState('');
    const [lastInputValue, setLastInputValue] = useState('');

    useEffect(() => {
        setIsContinueBtnDisabled(
            firstInputMatch !== firstInputValue ||
            lastInputMatch !== lastInputValue              
        );
    }, [firstInputValue, lastInputValue]);

    useEffect(() => {
        return () => {
            setFirstInputValue('');
            setLastInputValue('');
        };
    }, []);

    return (
        <div className='Confirm-Modal-Body-Container'>
            <div className='Confirm-Modal-Input-Container'>
                {firstInputRender}
                <Input
                    value={firstInputValue}
                    onChange={(e) => setFirstInputValue(e.target.value)}
                />
            </div>

            <div className='Confirm-Modal-Input-Container'>
                {lastInputRender}
                <Input
                    value={lastInputValue}
                    onChange={(e) => setLastInputValue(e.target.value)}
                />
            </div>
        </div>
    );
};

export default ConfirmModalBody;