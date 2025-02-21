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
import { BsArrowRight } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authenticate } from '@services/github/operations';
import { useDocumentTitle } from '@hooks/common';
import Loader from '@components/atoms/Loader';
import Button from '@components/atoms/Button';
import AnimatedMain from '@components/atoms/AnimatedMain';
import './NeedAuthenticate.css';

const NeedAuthenticate = () => {
    const { isLoading } = useSelector(state => state.github);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    useDocumentTitle('Github Authentication');

    useEffect(() => {
        if(user?.github?._id)
            navigate('/');
    }, [user]);

    return (isLoading) ? (
        <AnimatedMain id='Github-Need-Authenticate-Loading-Main'>
            <Loader scale='0.7' />
            <p>Connecting to your Github account...</p>
        </AnimatedMain>
    ) : (
        <AnimatedMain id='Github-Need-Authenticate-Main'>
            <section id='Github-Need-Authenticate-Body'>
                <article id='Github-Need-Authenticate-Title-Container'>
                    <h1 id='Github-Need-Authenticate-Title'>We are almost ready...</h1>
                    <p id='Github-Need-Authenticate-Subtitle'>You must link your Github account to be able to, among other things, deploy your repositories.</p>
                </article>
        
                <article id='Github-Need-Authenticate-Body'>
                    <Button 
                        onClick={() => authenticate(user._id)}
                        title='Proceed to Github' 
                        variant='Contained Big-Border-Radius' 
                        icon={<BsArrowRight />} />
                </article>
            </section>
        </AnimatedMain>
    );
};

export default NeedAuthenticate;