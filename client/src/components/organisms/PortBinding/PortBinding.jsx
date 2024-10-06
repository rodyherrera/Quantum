import React from 'react';
import { PortBindingBody } from '@components/molecules/PortBinding';
import { DashboardCard } from '@components/atoms/DashboardCard';
import './PortBinding.css';

const PortBinding = ({ portBinding }) => {

    return (
        <DashboardCard>
            <PortBindingBody portBinding={portBinding} />
        </DashboardCard>
    );
};

export default PortBinding;