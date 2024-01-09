import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderNavItem.css';

const HeaderNavItem = ({ title, to, ...props }) => {
    const navigate = useNavigate();

    return (
        <div 
            className='Header-Navigation-Item-Container' 
            onClick={() => navigate(to)}
            {...props}
        >
            <h3 className='Header-Navigation-Item-Title'>{title}</h3>
        </div>
    );
};

export default HeaderNavItem;