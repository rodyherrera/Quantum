import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEnvironVariables } from '@services/env/slice';
import Input from '@components/atoms/Input';
import useServerIP from '@hooks/useServerIP';
import './EnvironVariables.css';

const EnvironVariables = () => {
    const dispatch = useDispatch();
    const { environVariables } = useSelector((state: any) => state.env);
    const { serverIP } = useServerIP();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [tabOpened, setTabOpened] = useState(false);

    const handleInputChange = (name: string, value: string) => {
        dispatch(setEnvironVariables({ ...environVariables, [name]: value }));
    };

    useEffect(() => {
        if(!serverIP) return;
        dispatch(setEnvironVariables({ 
            ...environVariables, 
            SERVER_IP: serverIP,
            CLIENT_HOST: `http://${serverIP}:${environVariables.CLIENT_WEB_APP_PORT}`,
            DOMAIN: `http://${serverIP}:${environVariables.SERVER_PORT}`
        }));
    }, [dispatch, serverIP]);

    useEffect(() => {
        dispatch(setEnvironVariables({
            ...environVariables,
        }));
    }, []);

    useEffect(() => {
        const { CLIENT_HOST, DOMAIN } = environVariables;
        
        if(!CLIENT_HOST || !DOMAIN){
            return;
        }

        const checkEndpoint = async (url: string): Promise<boolean> => {
            try{
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                await fetch(url, { 
                    method: 'HEAD', 
                    mode: 'no-cors',
                    signal: controller.signal 
                });
                
                clearTimeout(timeoutId);
                return true;
            }catch(error){
                console.error(`Error checking ${url}:`, error);
                return false;
            }
        };

        const checkEndpoints = async () => {
            if(tabOpened) return;
            
            try{
                const clientOnline = await checkEndpoint(CLIENT_HOST);
                const domainOnline = await checkEndpoint(DOMAIN);
                
                if(clientOnline && domainOnline){
                    console.log('Both endpoints are online, opening CLIENT_HOST tab');
                    window.open(CLIENT_HOST, '_blank');
                    setTabOpened(true);
                    
                    if(intervalRef.current){
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            }catch(error){
                console.error('Error checking endpoints:', error);
            }
        };

        if(!intervalRef.current){
            intervalRef.current = setInterval(checkEndpoints, 10000);
        }
        
        checkEndpoints();

    }, [environVariables.CLIENT_HOST, environVariables.DOMAIN, tabOpened]);


    return (
        <React.Fragment>
            <Input
                type='text'
                value={environVariables.SERVER_IP || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('SERVER_IP', e.target.value)}
                placeholder='Server IP address (e.g. 152.53.39.92)'
                helperText='* The IP address of your server. It must be the IP of your VPS. If you try to deploy within Google IDX, Gitpod, Github Codespace or related you will have errors.'
            />

            <Input
                type='text'
                value={environVariables.CLIENT_HOST || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('CLIENT_HOST', e.target.value)}
                placeholder='Client Application Endpoint (e.g. https://quantumapp.com)'
                helperText='* For example quantumapp.com. Through this domain you can access the web application. Also, if you configure OAuth on Github, you must point to this domain.'
            />

            <Input
                type='text'
                value={environVariables.DOMAIN || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('DOMAIN', e.target.value)}
                placeholder='Server Endpoint (e.g. https://quantumserver.com)'
                helperText='* For example quantumserver.com. This domain will be used by the client application to make calls to the API.'
            />

            <Input
                type='text'
                value={environVariables.GITHUB_CLIENT_ID || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('GITHUB_CLIENT_ID', e.target.value)}
                placeholder='Github Client ID (e.g. 1234567890)'
                helperText='The client ID of your GitHub OAuth application. You will need to create an OAuth application in your Github account. This is optional if you do not want to have continuous deployment and deploy your repositories.'
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