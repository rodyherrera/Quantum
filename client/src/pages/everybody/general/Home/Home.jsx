import React from 'react';
import Button from '@components/general/Button';
import DashedContainer from '@components/general/DashedContainer';
import CircleContainedText from '@components/general/CircleContainedText';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const HomePage = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();

    return (
        <main id='Home-Page-Main'>
            <section id='Home-Left-Container'>
                <article id='Home-Left-Container-Platform-Container'>
                    <h1 id='Home-Left-Container-Title'>Unlock your <br/>entrepreneurial spirit!</h1>
                    <p id='Home-Left-Container-Subtitle'>
                        <span>Invest in applications, not operations.</span>
                        <DashedContainer>We handle the hard things.</DashedContainer>
                    </p>
                </article>
                <article id='Home-Left-Container-Actions-Container'>
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
        </main>
    );
};

export default HomePage;