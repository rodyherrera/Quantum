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

import React, { useRef } from 'react';
import HeaderNavItem from '@components/header/HeaderNavItem';
import IconLink from '@components/general/IconLink';
import HamburguerMenu from '@components/menu/HamburguerMenu';
import { logout } from '@services/authentication/operations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setIsCloudConsoleEnabled } from '@services/core/slice';
import * as coreSlice from '@services/core/slice';
import './Header.css';

const Header = () => {
    const headerRef = useRef(null);
    const { isAuthenticated } = useSelector(state => state.auth);
    const { isMenuEnabled, isCloudConsoleEnabled } = useSelector(state => state.core);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <header className='Header' ref={headerRef}>
            <section className='Header-Left-Container Header-Child-Container'>
                <article className='Header-Brand-Container' onClick={() => navigate('/')}>
                    <i className='Header-Brand-Logo'></i>
                    <h1 className='Header-Brand-Title'>Quantum</h1>
                </article>
            </section>
            <section className='Header-Center-Container Header-Child-Container'>
                <article className='Header-Links-Container'>
                    <div className='Header-Links-Left-Container'>
                        <IconLink title='Create Deployment' to='/repository/create/' />
                        <IconLink title='Privacy Policy' to='/legal/privacy-policy/' />
                        <IconLink title='Service Status' to='/service-status/' />
                    </div>
                    <div className='Header-Links-Right-Container'>
                        {(isAuthenticated) && (
                            <IconLink title='Cloud Console' onClick={() => dispatch(setIsCloudConsoleEnabled(!isCloudConsoleEnabled))} />
                        )}
                    </div>
                </article>
            </section>
            <section className='Header-Right-Container Header-Child-Container'>
                <article className='Header-Navigation-Container'>
                    {isAuthenticated ? (
                        <React.Fragment>
                            <HeaderNavItem title='Dashboard' to='/dashboard/' />
                            <HeaderNavItem title='Sign Out' onClick={() => dispatch(logout())} />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <HeaderNavItem title='Sign Up' to='/auth/sign-up/' />
                            <HeaderNavItem title='Log In' to='/auth/sign-in/' />
                        </React.Fragment>
                    )}
                    <HeaderNavItem className='Hamburguer-Menu-Container'>
                        <HamburguerMenu
                            onClick={() => dispatch(coreSlice.setIsMenuEnabled(!isMenuEnabled))}
                            isactive={isMenuEnabled.toString()} />
                    </HeaderNavItem>
                </article>
            </section>
        </header>
    );
};

export default Header;