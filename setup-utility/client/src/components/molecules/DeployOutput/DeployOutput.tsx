import './DeployOutput.css';

const DeployOutput = ({ output }: { output: string }) => {
    return (
        <div className='Setup-Utility-Deploy-Output'>
            <pre>{output}</pre>
        </div>
    );
};

export default DeployOutput;