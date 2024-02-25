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
import { logout } from '@services/authentication/operations';
import { useSelector, useDispatch } from 'react-redux';
import { setIsMenuEnabled } from '@services/core/slice';
import HeaderNavItem from '@components/header/HeaderNavItem';
import HamburguerMenu from '@components/menu/HamburguerMenu';
import './HeaderNavigation.css';

const HeaderNavigation = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const { isMenuEnabled } = useSelector(state => state.core);
    const dispatch = useDispatch();

    return (
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
                    onClick={() => dispatch(setIsMenuEnabled(!isMenuEnabled))}
                    isactive={isMenuEnabled.toString()} />
            </HeaderNavItem>
        </article>
    );
};

export default HeaderNavigation;