import React from 'react';
import { GoArrowUpLeft } from "react-icons/go";
import './DashboardModuleFooter.css';

const DashboardModuleFooter = ({ results, total, alias }) => {

    return (
        <div className='Dashboard-Module-Bottom-Container'>
            <div className='Dashboard-Module-Bottom-Results-View-All-Container'>
                <i className='Dashboard-Module-Bottom-Results-View-All-Icon-Container'>
                    <GoArrowUpLeft />
                </i>
                <h3 className='Dashboard-Module-Bottom-Results-View-All-Title'>View All</h3>
            </div>
            <div className='Dashboard-Module-Bottom-Results-Container'>
                <p className='Dashboard-Module-Bottom-Results'>Displaying {results} of {total} {alias}.</p>
            </div>
        </div>
    );
};

export default DashboardModuleFooter;