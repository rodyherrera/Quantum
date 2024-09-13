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
import Button from '@components/atoms/Button';
import './EnvironmentMobileActions.css';

const EnvironmentMobileActions = ({ addNewVariableHandler, saveHandler }) => {
    return (
        <aside className='Mobile-Environment-Actions-Container'>
            <article className='Mobile-Environment-Actions'>
                <Button title='Add new variable' onClick={addNewVariableHandler} />
                <Button title='Save changes' variant='Contained' onClick={saveHandler} />
            </article>
        </aside>
    );
};

export default EnvironmentMobileActions;