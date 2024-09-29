import React from 'react';
import './DashboardCardFooter.css';

const DashboardCardFooter = ({ options }) => {
    return (
        <div className='Dashboard-Card-Container-Footer'>
            <div className='Dashboard-Card-Container-Footer-Left-Container'>
                {options.map(([ item, Icon ], index) => (
                    <div className='Dashboard-Card-Container-Footer-Option-Container' key={index}>
                        <i className='Dashboard-Card-Container-Footer-Option-Icon-Container'>
                            <Icon />
                        </i>
                        <p className='Dashboard-Card-Container-Footer-Option-Title'>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardCardFooter;