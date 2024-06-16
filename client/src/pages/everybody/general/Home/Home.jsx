/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import React, { useEffect } from 'react';
import { gsap } from 'gsap'; 
import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
import { HiOutlineArrowRight } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WelcomeSection from '@components/general/WelcomeSection';
import Button from '@components/general/Button';
import AnimatedMain from '@components/general/AnimatedMain';
import DashedContainer from '@components/general/DashedContainer';
import CircleContainedText from '@components/general/CircleContainedText';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();


    useEffect(() => {
        // Title Animation Setup
        const titleElements = '#Home-Presentation-Title-Container h1';
        gsap.fromTo(titleElements, {
            y: 30,
            opacity: 0
        }, { 
            y: 0, 
            opacity: 1, 
            duration: 0.5,
            delay: 0.1, 
            stagger: 0.2, 
            ease: 'back'
        }); 

        // Subtitle Animations
        gsap.fromTo('#Home-Presentation-Container-Subtitle', {
            y: 20,
            opacity: 0
        }, { 
            y: 0, 
            opacity: 1, 
            duration: 0.7,
            delay: 0.5 
        });
        gsap.fromTo('#Home-Short-Subtitle', {
            opacity: 0,
            scale: 0.95,
        }, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#Home-Short-Subtitle',
                start: 'top 80%',
            }
        });

        // Button Slide-in Animations
        const actionButtons = '#Home-Presentation-Container-Actions-Container button';
        gsap.fromTo(actionButtons, {
            // Slide opposite directions
            x: (index) => index === 0 ? -50 : 50, 
            opacity: 0
        }, { 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: 'back(2)', 
        });

        // Docs Button and Circle Animations
        gsap.fromTo('#Docs-Button', {
            y: 20,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#Docs-Button',
                start: 'top 80%',
            }
        });
        gsap.fromTo('#Circle-Contained-Text-Wrapper', {
            opacity: 0, 
            scale: 0.8,
        }, {
            scale: 1,
            opacity: 1,
            duration: 1.2, 
            ease: 'back(1.5)',
            scrollTrigger: {
                trigger: '#Circle-Contained-Text-Wrapper',
                start: 'top 70%'
            } 
        });
    }, []); 
    
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
                        <h1 id='Home-Presentation-Container-Title'>
                            <span>Unlock your </span>
                            <br/>
                            <span>entrepreneurial spirit!</span>
                        </h1>
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