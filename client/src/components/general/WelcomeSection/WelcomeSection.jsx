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
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import IconLink from '@components/general/IconLink';
import './WelcomeSection.css';

gsap.registerPlugin(ScrollTrigger);

const WelcomeSection = ({ ...props }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const links = [
        ['Support Us', 'https://ko-fi.com/codewithrodi'],
        ['Contribute', 'https://ko-fi.com/codewithrodi'],
        ['Github', 'https://github.com/rodyherrera/Quantum/']
    ];

    useEffect(() => {
        gsap.fromTo('.Welcome-Title', {
            opacity: 0
        }, {
            opacity: 1,
            duration: 0.8,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: '.Welcome-Container', 
                start: 'top 80%'
            }
        });

        // Target links directly with a more specific selector 
        gsap.fromTo('.Welcome-Navigation-Container div', {
            x: -30,
            opacity: 0,
        }, { 
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back(1.5)',
            scrollTrigger: {
                trigger: '.Welcome-Navigation-Container', 
                start: 'top 80%'
            }
        });

        // Target icons - Add a class to icons if needed for specificity
        gsap.from('.Welcome-Navigation-Container div svg', { 
            rotation: 15,
            duration: 0.4,
            ease: 'power1.out'
        });
    }, []);

    return (
        <aside className='Welcome-Container' {...props}>
            <p className='Welcome-Title'>
                {(isAuthenticated) ? (
                    <span>Welcome back <b>@{user.username}</b>!</span>
                ) : (
                    <span>You're not authenticated yet.</span>
                )}
            </p>
            <ul className='Welcome-Navigation-Container'>
                {links.map(([ title, to ], index) => (
                    <IconLink
                        key={index}
                        icon={<FaLongArrowAltRight />}
                        title={title}
                        to={to} />
                ))}
            </ul>
        </aside> 
    );
};

export default WelcomeSection;