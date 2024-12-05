import './StepsContainer.css';

const StepsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <article className='Setup-Utility-Steps-Container'>
            {children}
        </article>
    );
};

export default StepsContainer;