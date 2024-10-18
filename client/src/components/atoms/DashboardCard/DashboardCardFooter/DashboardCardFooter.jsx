import React from 'react';
import './DashboardCardFooter.css';
import { useNavigate } from 'react-router-dom';

const DashboardCardFooter = ({ options }) => {
    const navigate = useNavigate();

    return (
        <div className='Dashboard-Card-Container-Footer'>
            <div className='Dashboard-Card-Container-Footer-Left-Container'>
                {options.map(([ item, Icon, to = '/' ], index) => (
                    <div 
                        className='Dashboard-Card-Container-Footer-Option-Container' 
                        onClick={() => navigate(to)}
                        key={index}
                    >
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