import React from 'react';
import Input from '@components/general/Input';
import { useDispatch, useSelector } from 'react-redux';
import * as deploymentSlice from '@services/deployment/slice';
import './EnvironmentVariable.css';

const EnvironmentVariable = ({ name, value, index, ...props }) => {
    const dispatch = useDispatch();
    const { environmentVariables } = useSelector(state => state.deployment);

    const updateEnvironmentVariable = (newKey, newValue) => {
        const updatedVariables = environmentVariables.map((variable, i) => {
            if(i === index){
                return [newKey, newValue];
            }
            return variable;
        });

        dispatch(deploymentSlice.setEnvironmentVariables(updatedVariables));
    };

    return (
        <div className='Environment-Variable-Container' {...props}>
            <div className='Environment-Variable-Key-Container'>
                <Input 
                    type='text' 
                    placeholder='e.g. CLIENT_KEY'
                    onChange={(e) => updateEnvironmentVariable(e.target.value, value)}
                    name={name} 
                    value={name} /> 
            </div>
            <div className='Environment-Variable-Union' />
            <div className='Environment-Variable-Value-Container'>
                <Input 
                    placeholder='Enter a value for the variable.'
                    type='text' 
                    onChange={(e) => updateEnvironmentVariable(name, e.target.value)}
                    name={value} 
                    value={value} />
            </div>
        </div>
    );
};

export default EnvironmentVariable;