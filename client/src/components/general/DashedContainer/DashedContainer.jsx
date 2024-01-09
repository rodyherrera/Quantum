import React from 'react';
import './DashedContainer.css';

const DashedContainer = ({ children }) => {
    return (
        <span className='Dashed-Container'>
            {children}
        </span>
    );
};

export default DashedContainer;