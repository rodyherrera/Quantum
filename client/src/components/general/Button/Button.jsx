import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Button.css';

const Button = ({ title, icon = null, to = null, variant = null, ...props }) => {
    const navigate = useNavigate();

    return (
        <button 
            onClick={() => (to) && (navigate(to))}
            className={`Button ${variant ? ` ${variant}` : ''}`}
            {...props}
        >
            <span className='Button-Text'>{title}</span>
            {icon && <i className='Button-Icon'>{icon}</i>}
        </button>
    );
};

export default Button;