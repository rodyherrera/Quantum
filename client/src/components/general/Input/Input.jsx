import React from 'react';
import './Input.css';

const Input = ({ helperText, ...props }) => {

    return (
        <div className='Input-Container'>
            <div className='Input-Wrapper-Container'>
                <input className='Input' {...props} />
            </div> 
            <div className='Input-Helper-Text-Container'>
                <p className='Input-Helper-Text'>{helperText}</p>
            </div>
        </div>
    );
};

export default Input;