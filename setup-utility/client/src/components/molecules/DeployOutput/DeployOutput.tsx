import { useEffect, useRef } from 'react';
import useWebSocket from '@hooks/useWebSocket';
import LoadingScreen from '@components/molecules/LoadingScreen';
import './DeployOutput.css';

const DeployOutput = () => {
    const { isConnected, messages } = useWebSocket();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(!messages.length){
            return;
        }
        scrollToBottom();
    }, [messages]);

    return (
        <div className='Setup-Utility-Deploy-Output'>
            {!isConnected && (
                <LoadingScreen message='Trying to establish communication with server...' />
            )}
            {isConnected ? <p>Connected to server</p> : <p>Connecting to server...</p>}
            {messages.map((message, index) => (
                <p key={index}>{message}</p>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default DeployOutput;