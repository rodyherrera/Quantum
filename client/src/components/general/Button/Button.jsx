import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Button.css';

const Button = ({ title, icon = null, to = null, variant = null, ...props }) => {
    const navigate = useNavigate();

    const handleOnClick = () => {
        props?.onClick?.();
        if(!to) return;
        const startsWithHTTP = to.startsWith('http');
        if(startsWithHTTP){
            window.open(to);
            return;
        }
        navigate(to);
    };

    return (
        <button 
        {...props}
        className={`Button ${variant ? ` ${variant}` : ''}`}
        onClick={handleOnClick}
>
            <span className='Button-Text'>{title}</span>
            {icon && <i className='Button-Icon'>{icon}</i>}
        </button>
    );
};

export default Button;