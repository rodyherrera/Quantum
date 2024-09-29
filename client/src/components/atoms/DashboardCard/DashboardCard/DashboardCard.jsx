import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ children }) => {

    return (
        <div className='Dashboard-Card-Container'>
            {children}
        </div>
    );
};

export default DashboardCard;