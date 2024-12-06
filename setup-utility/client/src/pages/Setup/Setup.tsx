import StepContainer from '@components/atoms/StepContainer';
import StepsContainer from '@components/molecules/StepsContainer';
import Button from '@components/atoms/Button';
import DeployOutput from '@components/molecules/DeployOutput';
import OptionalEnvironVariables from '@components/molecules/OptionalEnvironVariables';
import EnvironVariables from '@components/molecules/EnvironVariables';
import './Setup.css';

const SetupPage = () => {

    return (
        <main id='Setup-Utility-Main'>
            <section className='Setup-Utility-Left-Container'>
                <StepsContainer>
                    {[
                        'Getting Started',
                        'Configuring Domains',
                        'Connecting to GitHub',
                        'Secret Keys (autogenerated)'
                    ].map((title, index) => (
                        <StepContainer key={index} title={title} />
                    ))}
                </StepsContainer>
            </section>

            <section className='Setup-Utility-Container'>
                <h3 className='Setup-Utility-Header-Title'>Deploying your Quantum instance.</h3>

                <form className='Setup-Utility-Form-Container'>
                    <EnvironVariables />
                    <OptionalEnvironVariables />
                    <Button text='Deploy' />
                </form>
            </section>

            <DeployOutput />
        </main>
    );
};

export default SetupPage;