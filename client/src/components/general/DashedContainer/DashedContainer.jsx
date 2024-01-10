import React from 'react';
import './DashedContainer.css';

const DashedContainer = ({ children, ...props }) => {
    return (
        <span className='Dashed-Container' {...props}>
            {children}
        </span>
    );
};

export default DashedContainer;