import React from 'react';
import { GoArrowUpRight } from 'react-icons/go';
import { GoArrowUpLeft } from "react-icons/go";
import './DashboardModule.css';

const DashboardModule = ({
    Icon,
    title,
    total,
    results,
    RenderComponent,
    alias = 'document(s)'
}) => {
    return (
        <div className='Dashboard-Module-Container'>
            <div className='Dashboard-Module-Header-Container'>
                <div className='Dashboard-Module-Header-Left-Container'>
                    <i className='Dashboard-Module-Header-Icon-Container'>
                        <Icon />
                    </i>
                    <h3 className='Dashboard-Module-Header-Title'>{title}</h3>
                </div>
                <div className='Dashboard-Module-Header-Right-Container'>
                    <div className='Dashboard-Module-Create-New-Container'>
                        <h3 className='Dashboard-Module-Create-New-Title'>Create New</h3>
                        <i className='Dashboard-Module-Create-New-Icon-Container'>
                            <GoArrowUpRight />
                        </i>
                    </div>
                </div>
            </div>
            <div className='Dashboard-Module-Body-Container'>
                <RenderComponent />
            </div>
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
        </div>
    );
};

export default DashboardModule;