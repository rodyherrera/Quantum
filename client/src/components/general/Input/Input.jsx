import React from 'react';
import './Input.css';

const Input = ({ helperText, endIcon = null, ...props }) => {

    return (
        <div className='Input-Container'>
            <div className='Input-Wrapper-Container'>
                <input className='Input' {...props} />
                {(endIcon) && (
                    <i className='Input-End-Icon-Container Hover-Target' {...endIcon.props}>
                        {endIcon.render}
                    </i>
                )}
            </div> 
            <div className='Input-Helper-Text-Container'>
                <p className='Input-Helper-Text'>{helperText}</p>
            </div>
        </div>
    );
};

export default Input;