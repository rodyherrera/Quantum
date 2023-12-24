import React, { useEffect } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '@services/github/actions';
import Button from '@components/general/Button';
import './NeedAuthenticate.css';

const NeedAuthenticate = () => {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if(user?.github?._id)
            navigate('/');
    }, [user]);

    return (
        <main id='Github-Need-Authenticate-Main'>
            <section id='Github-Need-Authenticate-Body'>
                <article id='Github-Need-Authenticate-Title-Container'>
                    <h1 id='Github-Need-Authenticate-Title'>Let's start something new together...</h1>
                    <p id='Github-Need-Authenticate-Subtitle'>We will need you to authenticate using your Github account. We will gain access to your repositories to be able to deploy them.</p>
                </article>
        
                <article id='Github-Need-Authenticate-Body'>
                    <Button 
                        onClick={() => authenticate(user._id)}
                        title='Proceed to Github' 
                        variant='Form-Contained Black' 
                        icon={<BsArrowRight />} />
                </article>
            </section>
        </main>
    );
};

export default NeedAuthenticate;