import React from 'react';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import { GoLinkExternal } from 'react-icons/go';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import useServerIP from '@hooks/api/server/useServerIP';
import './PortBindingFooter.css';

const PortBindingFooter = ({ portBinding }) => {
    const { serverIP } = useServerIP();

    const visitHandler = () => {
        console.log(serverIP)
        const url = `http://${serverIP}:${portBinding.externalPort}`;
        window.open(url, '_blank').focus();
    };

    const options = [
        ['Delete', IoIosRemoveCircleOutline],
        ['Visit', GoLinkExternal, null, visitHandler]
    ];

    return <DashboardCardFooter options={options} />
};

export default PortBindingFooter;