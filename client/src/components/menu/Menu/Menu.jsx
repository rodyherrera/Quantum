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

import React from 'react';
import { BiHomeAlt2 } from 'react-icons/bi';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { BsBook, BsTerminal } from 'react-icons/bs';
import { CiServer } from 'react-icons/ci';
import { FiUser } from 'react-icons/fi';
import { RxReader } from 'react-icons/rx';
import { setIsCloudConsoleEnabled, setIsMenuEnabled } from '@services/core/slice';
import { GoProjectSymlink } from 'react-icons/go';
import { useDispatch } from 'react-redux';
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