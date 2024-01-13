import React, { useEffect, useRef } from 'react';
import Input from '@components/general/Input';
import { useDispatch, useSelector } from 'react-redux';
import { CiTrash } from 'react-icons/ci';
import * as deploymentSlice from '@services/deployment/slice';
import './EnvironmentVariable.css';

const EnvironmentVariable = ({ name, value, index, ...props }) => {
    const dispatch = useDispatch();
    const unionRef = useRef(null);
    const variableContainerRef = useRef(null);
    const { environmentVariables } = useSelector(state => state.deployment);

    const updateEnvironmentVariable = (newKey, newValue) => {
        const updatedVariables = environmentVariables.map((variable, i) => {
            if(i === index) return [newKey, newValue];
            return variable;
        });

        dispatch(deploymentSlice.setEnvironmentVariables(updatedVariables));
    };

    const handleDeletion = () => {
        const updatedVariables = environmentVariables.filter((_, i) => (i !== index));
        dispatch(deploymentSlice.setEnvironmentVariables(updatedVariables));
    };

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