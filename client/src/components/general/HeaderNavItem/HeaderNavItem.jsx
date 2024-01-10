import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderNavItem.css';

const HeaderNavItem = ({ title, to, children, ...props }) => {
    const navigate = useNavigate();

    return (
        <div 
            className='Header-Navigation-Item-Container' 
            onClick={() => (to) && (navigate(to))}
            {...props}
        >
            {(title) && (
                <h3 className='Header-Navigation-Item-Title'>{title}</h3>
            )}
            
            {(children) && (children)}
        </div>
    );
};

export default HeaderNavItem;