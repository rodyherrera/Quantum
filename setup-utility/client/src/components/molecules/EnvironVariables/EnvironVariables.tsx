import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEnvironVariables } from '@services/env/slice';
import Input from '@components/atoms/Input';
import useServerIP from '@hooks/useServerIP';
import './EnvironVariables.css';

const EnvironVariables = () => {
    const dispatch = useDispatch();
    const { environVariables } = useSelector((state: any) => state.env);
    const { serverIP } = useServerIP();

    const handleInputChange = (name: string, value: string) => {
        dispatch(setEnvironVariables({ ...environVariables, [name]: value }));
    };

    return (
        <React.Fragment>
            <Input
                type='text'
                value={serverIP || environVariables.SERVER_IP || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('SERVER_IP', e.target.value)}
                placeholder='Server IP address (e.g. 152.53.39.92)'
                helperText='The IP address of your server'
            />

            <Input
                type='text'
                value={environVariables.CLIENT_HOST || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('CLIENT_HOST', e.target.value)}
                placeholder='Client Application Domain (e.g. quantumapp.com)'
                helperText='For example quantumapp.com. Through this domain, you will be able to access the platform to manage your deployments and more.'
            />

            <Input
                type='text'
                value={environVariables.DOMAIN || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('DOMAIN', e.target.value)}
                placeholder='Server Domain (e.g. quantumserver.com)'
                helperText='For example quantumserver.com. This domain will be used to access the server API.'
            />

            <Input
                type='text'
                value={environVariables.GITHUB_CLIENT_ID || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('GITHUB_CLIENT_ID', e.target.value)}
                placeholder='Github Client ID (e.g. 1234567890)'
                helperText='The client ID of your GitHub OAuth application.'
            />

            <Input
                type='text'
                value={environVariables.GITHUB_CLIENT_SECRET || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('GITHUB_CLIENT_SECRET', e.target.value)}
                placeholder='Github Client Secret (e.g. 0987654321)'
                helperText='The client secret of your GitHub OAuth application.'
            />
        </React.Fragment>
    );
};

export default EnvironVariables;