import React, { useEffect } from 'react';
import { DashboardCardHeader } from '@components/atoms/DashboardCard';
import './PortBindingHeader.css';

const PortBindingHeader = ({ portBinding }) => {
    const options = [
        `Protocol: ${portBinding.protocol.toUpperCase()}`,
        `Container: ${portBinding.container.name} (${portBinding.container.ipAddress})`,
        `Network: ${portBinding.container.network}`
    ];

    return <DashboardCardHeader options={options} />
};

export default PortBindingHeader;