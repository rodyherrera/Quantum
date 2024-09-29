import React from 'react';
import './DashboardCardHeader.css';

const DashboardCardHeader = ({ options }) => {
    return (
        <div className='Dashboard-Card-Header-Container'>
            {options.map((item, index) => (
                <p className='Dashboard-Card-Header-Item' key={index}>{item}</p>
            ))}
        </div>
    );
};

export default DashboardCardHeader;