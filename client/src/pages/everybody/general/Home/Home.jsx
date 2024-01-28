import React from 'react';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WelcomeSection from '@components/general/WelcomeSection';
import Button from '@components/general/Button';
import AnimatedMain from '@components/general/AnimatedMain';
import DashedContainer from '@components/general/DashedContainer';
import CircleContainedText from '@components/general/CircleContainedText';
import './Home.css';

const HomePage = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();
    
    return (
        <AnimatedMain id='Home-Page-Main'>
            <section id='Home-Presentation-Container'>
                <Button 
                    to='https://github.com/rodyherrera/Quantum/'
                    id='Docs-Button'
                    icon={<HiOutlineArrowRight />}
                    title='Read the docs' 
                    variant='Contained End-Icon' />

                <article id='Home-Presentation-Container-Platform-Container'>
                    <span id='Home-Short-Subtitle'>Everything you need, in one place.</span>
                    <div id='Home-Presentation-Title-Container'>
                        <h1 id='Home-Presentation-Container-Title'>Unlock your <br/>entrepreneurial spirit!</h1>
                        <WelcomeSection />
                    </div>
                    <p id='Home-Presentation-Container-Subtitle'>
                        <span>Invest in applications, not operations.</span>
                        <DashedContainer>We handle the hard things.</DashedContainer>
                    </p>
                </article>
                <article id='Home-Presentation-Container-Actions-Container'>
                    {(isAuthenticated) ? (
                        <Button title='Go to Dashboard' to='/dashboard/' />
                    ) : (
                        <Button title='Start Deploying' to='/auth/sign-in/' />
                    )}
                    <Button title='Learn More' variant='Contained' />
                </article>
            </section>

            <aside id='Circle-Contained-Text-Wrapper'>
                <CircleContainedText 
                    onClick={() => navigate('/repository/create/')}
                    title='Deploy, Scale, Repeat.' />
            </aside>
        </AnimatedMain>
    );
};

export default HomePage;