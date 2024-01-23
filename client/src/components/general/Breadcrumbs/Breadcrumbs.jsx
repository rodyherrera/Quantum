import React, { useEffect } from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items, ...props }) => {
    const navigate = useNavigate();

    return (
        <div className='Breadcrumbs-Container' {...props}>
            <MUIBreadcrumbs separator='›'>
                {items.map((item, index) => (
                    <Link 
                        key={index} 
                        underline='hover' 
                        onClick={() => navigate(item.to)}
                    >{item.title}</Link>
                ))}
            </MUIBreadcrumbs>
        </div>
    );
};

export default Breadcrumbs;