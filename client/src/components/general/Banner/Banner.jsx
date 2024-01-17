import React from 'react';
import './Banner.css';

const Banner = ({ text }) => {

    return (
        <div id='Banner-Container'>
            <p id='Banner-Text' className='Secondary-Font'>{text}</p>
        </div>
    );
};

export default Banner;