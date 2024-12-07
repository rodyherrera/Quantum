import { useEffect, useRef } from 'react';
import useWebSocket from '@hooks/useWebSocket';
import LoadingScreen from '@components/molecules/LoadingScreen';
import './DeployOutput.css';

const DeployOutput = () => {
    const { isConnected, messages } = useWebSocket();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if(containerRef.current){
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if(!messages.length){
            return;
        }
        scrollToBottom();
    }, [messages]);

    return (
        <div className='Setup-Utility-Deploy-Output' ref={containerRef}>
            {!isConnected && (
                <LoadingScreen message='Trying to establish communication with server...' />
            )}
            {isConnected ? <p>Connected to server</p> : <p>Connecting to server...</p>}
            {messages.map((message, index) => (
                <p key={index}>{message}</p>
            ))}
        </div>
    );
};

export default DeployOutput;
