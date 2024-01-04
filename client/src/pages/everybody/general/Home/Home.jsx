import React from 'react';
import Button from '@components/general/Button';
import DashedContainer from '@components/general/DashedContainer';
import { useSelector } from 'react-redux';
import './Home.css';

const HomePage = () => {
    const { isAuthenticated } = useSelector(state => state.auth);

    return (
        <main id='Home-Page-Main'>
            <section id='Home-Left-Container'>
                <article id='Home-Left-Container-Title-Container'>
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
        </main>
    );
};

export default HomePage;