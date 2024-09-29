import React from 'react';
import './DashboardModuleBody.css';

const DashboardModuleBody = ({ RenderComponent }) => {

    return (
        <div className='Dashboard-Module-Body-Container'>
            <RenderComponent />
        </div>
    );
};

export default DashboardModuleBody;