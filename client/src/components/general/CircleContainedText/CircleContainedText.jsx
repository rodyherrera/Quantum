import React from 'react';
import './CircleContainedText.css';

const CircleContainedText = ({ title, ...props }) => {
    return (
        <div className='Circle-Content-Container' {...props}>
            <h3 className='Circle-Content-Container-Title'>{title}</h3>
        </div>
    );
};

export default CircleContainedText;