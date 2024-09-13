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

import React, { useEffect, useRef } from 'react';
import Input from '@components/atoms/Input';
import { useDispatch, useSelector } from 'react-redux';
import { CiTrash } from 'react-icons/ci';
import * as deploymentSlice from '@services/deployment/slice';
import './EnvironmentVariable.css';

/**
 * Component to represent an individual environment variable.
 * 
 * @param {string} name -  Name of the environment variable.
 * @param {string} value - Environment variable value.
 * @param {number} index -  Index of the tone variable within its list.
 * @param {object} props -  Additional props for the component.
*/
const EnvironmentVariable = ({ name, value, index, ...props }) => {
    const dispatch = useDispatch();
    const unionRef = useRef(null);
    const variableContainerRef = useRef(null);
    const { environment } = useSelector(state => state.deployment);

    /**
     * Updates the environment variable when modifying the name or value field.
     * 
     * @param {string} newKey - The new name of the variable.
     * @param {string} newValue - The new value of the variable.
    */
    const updateEnvironmentVariable = (newKey, newValue) => {
        const updatedVariables = environment.variables.map((variable, i) => {
            if(i === index) return [newKey, newValue];
            return variable;
        });

        dispatch(deploymentSlice.setEnvironment({ ...environment, variables: updatedVariables }));
    };

    const handleDeletion = () => {
        const updatedVariables = environment.variables.filter((_, i) => (i !== index));
        dispatch(deploymentSlice.setEnvironment({ ...environment, variables: updatedVariables }));
    };

    // Handle clicks outside the component (to reset the style)
    useEffect(() => {
        if(!variableContainerRef.current || !unionRef.current) return;
        const clickEventHandler = (e) => {
            if(variableContainerRef.current.contains(e.target)){
                unionRef.current.style.backgroundColor = 'blue';
                return;
            }
            unionRef.current.style.backgroundColor = '#000000';
        };
        window.addEventListener('click', clickEventHandler);
        return () => {
            window.removeEventListener('click', clickEventHandler);
        };
    }, []);

    return (
        <div className='Environment-Variable-Container' {...props} ref={variableContainerRef}>
            <div className='Environment-Variable-Key-Container'>
                <Input 
                    type='text' 
                    placeholder='e.g. CLIENT_KEY'
                    onChange={(e) => updateEnvironmentVariable(e.target.value, value)}
                    name={name} 
                    value={name} /> 
            </div>
            <div className='Environment-Variable-Union' ref={unionRef} />
            <div className='Environment-Variable-Value-Container'>
                <Input 
                    placeholder='Enter a value for the variable.'
                    type='text' 
                    endIcon={{
                        render: <CiTrash />,
                        props: { onClick: handleDeletion }
                    }}
                    onChange={(e) => updateEnvironmentVariable(name, e.target.value)}
                    name={value} 
                    value={value} />
            </div>
        </div>
    );
};

export default EnvironmentVariable;