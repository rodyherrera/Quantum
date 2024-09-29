import React from 'react';
import { GoArrowUpRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import './DashboardModuleHeader.css';

const DashboardModuleHeader = ({ Icon, title, createLink }) => {
    const navigate = useNavigate();

    return (
        <div className='Dashboard-Module-Header-Container'>
            <div className='Dashboard-Module-Header-Left-Container'>
                <i className='Dashboard-Module-Header-Icon-Container'>
                    <Icon />
                </i>
                <h3 className='Dashboard-Module-Header-Title'>{title}</h3>
            </div>
            <div className='Dashboard-Module-Header-Right-Container'>
                <div className='Dashboard-Module-Create-New-Container' onClick={() => navigate(createLink)}>
                    <h3 className='Dashboard-Module-Create-New-Title'>Create New</h3>
                    <i className='Dashboard-Module-Create-New-Icon-Container'>
                        <GoArrowUpRight />
                    </i>
                </div>
            </div>
        </div>
    );
};

export default DashboardModuleHeader;