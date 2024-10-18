import React, { useEffect } from 'react';
import { PortBindingBody, PortBindingHeader, PortBindingFooter } from '@components/molecules/PortBinding';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './PortBinding.css';

const PortBinding = ({ portBinding }) => {

    useEffect(() => {
        console.log(portBinding);
    }, []);

    return (
        <DashboardCard>
            <PortBindingHeader portBinding={portBinding} />
            <PortBindingBody portBinding={portBinding} />
            <PortBindingFooter portBinding={portBinding} />
        </DashboardCard>
    );
};

export default PortBinding;