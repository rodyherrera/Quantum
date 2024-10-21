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

import React, { useCallback, useRef } from 'react';
import Input from '@components/atoms/Input';
import { CiTrash } from 'react-icons/ci';
import './EnvironmentVariable.css';

const EnvironmentVariable = ({ name, value, index, environment, onUpdateVariable, ...props }) => {
    const variableContainerRef = useRef(null);

    const updateEnvironVariable = useCallback((newKey, newValue) => {
        if(!environment || !Array.isArray(environment.variables)) return;
        const updatedVariables = environment.variables.map((variable, i) => {
            if(i === index) return [newKey, newValue];
            return variable;
        });
        onUpdateVariable(updatedVariables);
    }, [environment, index, onUpdateVariable]);

    const handleDeletion = useCallback(() => {
        if(!environment || !Array.isArray(environment.variables)) return;
        const updatedVariables = environment.variables.filter((_, i) => i !== index);
        onUpdateVariable(updatedVariables);
    }, [environment, index, onUpdateVariable]);

    return (
        <div className='Environment-Variable-Container' {...props} ref={variableContainerRef}>
            <div className='Environment-Variable-Key-Container'>
                <Input 
                    type='text' 
                    placeholder='e.g. CLIENT_KEY'
                    onChange={(e) => updateEnvironVariable(e.target.value, value)}
                    name={name} 
                    value={name} /> 
            </div>
            <div className='Environment-Variable-Union' />
            <div className='Environment-Variable-Value-Container'>
                <Input 
                    placeholder='Enter a value for the variable.'
                    type='text' 
                    endIcon={{
                        render: <CiTrash />,
                        props: { onClick: handleDeletion }
                    }}
                    onChange={(e) => updateEnvironVariable(name, e.target.value)}
                    name={value} 
                    value={value} />
            </div>
        </div>
    );
};

export default EnvironmentVariable;