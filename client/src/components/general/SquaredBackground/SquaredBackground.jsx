import React from 'react';
import './SquaredBackground.css';

const SquaredBackground = ({ ...props }) => {

    return (
        <aside className='Squared-Background-Container' {...props} />
    );
};

export default SquaredBackground;