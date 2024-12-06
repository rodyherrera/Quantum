import React from 'react';
import Input from '@components/atoms/Input';
import useServerIP from '@hooks/useServerIP';
import './EnvironVariables.css';

const EnvironVariables = () => {
    const { serverIP } = useServerIP();

    return (
        <React.Fragment>
            <Input
                type='text'
                value={serverIP}
                placeholder='Server IP address (e.g. 152.53.39.92)'
                helperText='The IP address of your server'
            />

            <Input
                type='text'
                placeholder='Client Application Domain (e.g. quantumapp.com)'
                helperText='For example quantumapp.com. Through this domain, you will be able to access the platform to manage your deployments and more.'
            />

            <Input
                type='text'
                placeholder='Server Domain (e.g. quantumserver.com)'
                helperText='For example quantumserver.com. This domain will be used to access the server API.'
            />

            <Input
                type='text'
                placeholder='Github Client ID (e.g. 1234567890)'
                helperText='The client ID of your GitHub OAuth application.'
            />

            <Input
                type='text'
                placeholder='Github Client Secret (e.g. 0987654321)'
                helperText='The client secret of your GitHub OAuth application.'
            />
        </React.Fragment>
    );
};

export default EnvironVariables;