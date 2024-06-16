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
import { CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getServerHealth } from '@services/core/operations';
import { FaCheckCircle } from 'react-icons/fa';
import { gsap } from 'gsap';
import Button from '@components/general/Button';
import AnimatedMain from '@components/general/AnimatedMain';
import './ServiceStatus.css';

const ServiceStatus = () => {
    const dispatch = useDispatch();
    const { serverHealth, isServerHealthLoading } = useSelector((state) => state.core);

    useEffect(() => {
        dispatch(getServerHealth());
    }, []);

    useEffect(() => {
        if(isServerHealthLoading) return;
        gsap.fromTo('#Service-Status-Container', {
            opacity: 0,
            x: -20
        }, {
            duration: 0.8,
            opacity: 1,
            x: 0,
            ease: 'back'
        });
        // Animate status details
        gsap.fromTo('#Service-Detailed-Status-Container p', {
            y: 20,
            opacity: 0
        }, {
            duration: 0.7,
            y: 0,
            opacity: 1,
            // Animate each paragraph slightly after the previous one
            stagger: 0.1, 
        });
        gsap.fromTo('#Service-Status-Footer-Container', {
            y: 50,
            opacity: 0
        }, {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: 'back',
        });
    }, [isServerHealthLoading]);

    return (
        <AnimatedMain id='Service-Status-Main'>
            <section id='Service-Status-Header-Container'>
                <article id='Service-Status-Title-Container'>
                    <h1 id='Service-Status-Title'>System status</h1>
                </article>
            </section>

            {isServerHealthLoading ? (
                <CircularProgress className='Circular-Progress' />
            ) : (
                <React.Fragment>
                <section id='Service-Status-Body-Container'>
                        <article 
                            id='Service-Status-Container' 
                            className={serverHealth.serverStatus === 'Server::Health::Overloaded' ? 'Error' : ''}
                        >
                            <i id='Service-Status-Icon'>
                                <FaCheckCircle />
                            </i>
                            
                            <h3 id='Service-Status'>
                            {serverHealth.serverStatus === 'Server::Health::Overloaded' 
                                ? 'Partially Degraded Service' : 'All Systems Operational'}
                            </h3>
                        </article>

                        <article id='Service-Detailed-Status-Container'>
                            {serverHealth.serverStatus === 'Server::Health::Overloaded' ? (
                                <p className='Service-Detailed-Status Error'>The server is overloaded. It is possible that the processing unit or RAM, or both, are over 80% used.</p>
                            ) : (
                                <p className='Service-Detailed-Status'>Server resources are controlled below 80%. The server is working optimally for all processes.</p>
                            )}
                            {serverHealth.ramStatus === 'Server::Health::RAM::Overloaded' ? (
                                <p className='Service-Detailed-Status Error'>The RAM memory is over 80% of its use. You may experience system slowdowns, including process termination. The operating system may use swap memory, which negatively affects server performance.</p>
                            ) : (
                                <p className='Service-Detailed-Status'>The ram memory is below 80% usage with respect to the total installed memory and the total available memory.</p>
                            )}
                            {serverHealth.cpuStatus === 'Server::Health::CPU::Overloaded' ? (
                                <p className='Service-Detailed-Status Error'>The processing unit is under intensive use at over 80% of its capacity. The performance of your services may be negatively affected, requests may experience delays, the server's responsiveness may decrease. You are likely to experience scalability issues.</p>
                            ) : (
                                <p className='Service-Detailed-Status'>The average processor usage considering all available threads is below 80%. The processor is not overloaded and is working optimally.</p>
                            )}
                        </article>
                    </section>

                    <section id='Service-Status-Footer-Container'>
                        <Button title='Check again' onClick={() => dispatch(getServerHealth())} />
                    </section>
                </React.Fragment>
            )}
        </AnimatedMain>
    );
};

export default ServiceStatus;