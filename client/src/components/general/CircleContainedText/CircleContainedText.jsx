import React from 'react';
import './CircleContainedText.css';

const CircleContainedText = ({ title, ...props }) => {
    return (
        <div id='Circle-Content-Container' {...props} className='Hover-Target'>
            <h3 id='Circle-Content-Container-Title'>{title}</h3>
        </div>
    );
};

export default CircleContainedText;