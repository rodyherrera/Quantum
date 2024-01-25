import React from 'react';
import './Banner.css';

const Banner = ({ text }) => {

    return (
        <div className='Banner-Container'>
            <p className='Banner-Text Secondary-Font'>{text}</p>
        </div>
    );
};

export default Banner;