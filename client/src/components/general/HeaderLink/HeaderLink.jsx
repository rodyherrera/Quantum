import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderLink.css';

const HeaderLink = ({ title, to, ...props }) => {
    const navigate = useNavigate();

    return (
        <div 
            className='Header-Link-Container' 
            onClick={() => navigate(to)}
            {...props}
        >
            <h3 className='Header-Link-Title'>{title}</h3>
        </div>
    );
};

export default HeaderLink;