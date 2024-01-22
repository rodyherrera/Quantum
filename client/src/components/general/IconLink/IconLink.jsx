import React from 'react';
import './IconLink.css';

const IconLink = ({ title, icon, ...props }) => {

    return (
        <div className='Icon-Link-Container' {...props}>
            <span className='Icon-Link-Title'>{title}</span>
            {(icon) && (
                <i className='Icon-Link-Icon-Container'>
                    {icon}
                </i>
            )}
        </div>
    );
};

export default IconLink;