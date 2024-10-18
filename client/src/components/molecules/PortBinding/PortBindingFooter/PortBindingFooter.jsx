import React from 'react';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import { GoLinkExternal } from 'react-icons/go';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import './PortBindingFooter.css';

const PortBindingFooter = () => {
    const options = [
        ['Delete', IoIosRemoveCircleOutline],
        ['Visit', GoLinkExternal]
    ];

    return <DashboardCardFooter options={options} />
};

export default PortBindingFooter;