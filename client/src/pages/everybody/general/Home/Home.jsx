import React from 'react';
import Button from '@components/general/Button';
import DashedContainer from '@components/general/DashedContainer';
import CircleContainedText from '@components/general/CircleContainedText';
import IconLink from '@components/general/IconLink';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const HomePage = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    return (
        <main id='Home-Page-Main'>
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

                        <aside id='Welcome-Container'>
                            <p id='Welcome-Title'>
                                {(isAuthenticated) ? (
                                    <span>Welcome back <b>@{user.username}</b>!</span>
                                ) : (
                                    <span>You're not authenticated yet.</span>
                                )}
                            </p>
                            <ul id='Welcome-Navigation-Container'>
                                {[
                                    ['Support Us', 'https://github.com/rodyherrera/Quantum/'],
                                    ['Contribute', 'https://github.com/rodyherrera/Quantum/'],
                                    ['Github', 'https://github.com/rodyherrera/Quantum/']
                                ].map(([ title, to ], index) => (
                                    <IconLink
                                        key={index}
                                        icon={<FaLongArrowAltRight />}
                                        title={title}
                                        to={to} />
                                ))}
                            </ul>
                        </aside>
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
        </main>
    );
};

export default HomePage;