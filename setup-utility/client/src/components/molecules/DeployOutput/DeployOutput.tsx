import useWebSocket from '@hooks/useWebSocket';
import './DeployOutput.css';

const DeployOutput = () => {
    const { isConnected, messages } = useWebSocket();

    return (
        <div className='Setup-Utility-Deploy-Output'>
            {isConnected ? <p>Connected to server</p> : <p>Connecting to server...</p>}
            {messages.map((message, index) => (
                <p key={index}>{message}</p>
            ))}
        </div>
    );
};

export default DeployOutput;