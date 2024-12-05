import './StepContainer.css';

const StepContainer = ({ title }: { title: string }) => {
    return (
        <div className='Setup-Utility-Step-Container'>
            <h3 className='Setup-Utility-Step-Title'>{title}</h3>
        </div>
    );
};

export default StepContainer;