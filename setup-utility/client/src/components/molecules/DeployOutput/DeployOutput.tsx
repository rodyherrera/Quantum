import useWebSocket from '@hooks/useWebSocket';
import './DeployOutput.css';

const DeployOutput = ({ output }: { output: string }) => {
    const { isConnected } = useWebSocket();

    return (
        <div className='Setup-Utility-Deploy-Output'>
            {isConnected ? <p>Connected to server</p> : <p>Connecting to server...</p>}
            <pre>{output}</pre>
        </div>
    );
};

export default DeployOutput;