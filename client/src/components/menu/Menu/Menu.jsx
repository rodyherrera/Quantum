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
import { BiHomeAlt2 } from 'react-icons/bi';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { BsBook, BsTerminal } from 'react-icons/bs';
import { CiServer } from 'react-icons/ci';
import { FiUser } from 'react-icons/fi';
import { RxReader } from 'react-icons/rx';
import { setIsCloudConsoleEnabled, setIsMenuEnabled } from '@services/core/slice';
import { GoProjectSymlink } from 'react-icons/go';
import { useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import MenuItem from '@components/menu/MenuItem';
import Button from '@components/general/Button';
import Header from '@components/header/Header';
import Banner from '@components/general/Banner';
import './Menu.css';

const Menu = () => {
    const dispatch = useDispatch();
    const menuItems = [
        ['Home', <BiHomeAlt2 />, '/'],
        ['My Account', <FiUser />, '/auth/account/'],
        ['Deployments', <MdOutlineSpaceDashboard />, '/dashboard/'],
        ['Create Deployment', <GoProjectSymlink />, '/repository/create/'],
        ['Service Status', <CiServer />, '/service-status/'],
        ['Privacy Policy', <RxReader />, '/legal/privacy-policy/'],
        ['Documentation', <BsBook />, 'https://github.com/rodyherrera/Quantum/']
    ];

    const cloudConsoleEnableHandler = () => {
        dispatch(setIsCloudConsoleEnabled(true));
        dispatch(setIsMenuEnabled(false));
    };

    useEffect(() => {
        const menuItems = document.querySelectorAll('.Menu-Item-Container');
        gsap.from(menuItems, {
            opacity: 0,
            // Random variation in 'y'
            y: () => (Math.random() - 0.5) * 30,
            // Random variation in 'x'
            x: () => (Math.random() - 0.5) * 20, 
            duration: 0.4, 
            ease: 'power3.out', 
            stagger: 0.1 
        });

        const buttons = document.querySelectorAll('.Menu-Header-Actions-Container .Button');
        gsap.from(buttons, { 
            opacity: 0, 
            scale: 0.9, 
            duration: 0.4,  
            ease: 'back.out(1.7)' // Easing con rebote
        });

        const copyrightText = document.querySelector('.Quantum-Copyright-Text'); 
        gsap.from(copyrightText, { 
            opacity: 0, 
            y: -50,  
            duration: 0.6, 
            ease: 'power2.out'
        }).then(() => {
            gsap.to(copyrightText, { 
                scale: 1.05, 
                duration: 0.5, 
                yoyo: true, 
                repeat: 1 
            });
        });

        const terminalButton = document.querySelector('.Menu-Bottom-Container button'); 
        const terminalIcon = terminalButton.querySelector('svg'); 
    
        gsap.from(terminalButton, { 
            opacity: 0, 
            x: 20,  
            duration: 0.4, 
            ease: 'power2.out' 
        });
        gsap.from(terminalIcon, { 
            opacity: 0,  
            delay: 0.2 
        });
    }, []);

    return (
        <aside className='Menu-Container'>
            <article className='Menu-Header-Container'>
                <Banner text='We streamline and automate your deployments 🔥' />
                <Header />

                <div className='Menu-Header-Actions-Container'>
                    <Button
                        to='https://github.com/rodyherrera/Quantum/'
                        variant='Contained Black Small Extended-Sides'
                        title='Github Repository' />
                    <Button
                        to='https://ko-fi.com/codewithrodi/'
                        variant='Small Extended-Sides'
                        title='Donate' />
                </div>
            </article>

            <ul className='Menu-Items-Container'>
                {menuItems.map(([ title, icon, to ], index) => (
                    <MenuItem key={index} title={title} icon={icon} to={to} />
                ))}
            </ul>
            
            <article className='Menu-Bottom-Container'>
                <p className='Quantum-Copyright-Text'>Quantum © 2024.</p>
                <Button 
                    title='Terminal' 
                    icon={<BsTerminal />} 
                    onClick={cloudConsoleEnableHandler}
                    variant='Start-Icon Small Extended-Sides Contained' />
            </article>
        </aside>
    );
};

export default Menu;