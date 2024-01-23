import React, { useEffect, useState } from 'react';
import HeaderNavItem from '@components/general/HeaderNavItem';
import IconLink from '@components/general/IconLink';
import HamburguerMenu from '@components/general/HamburguerMenu';
import { logout } from '@services/authentication/actions';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isHamburguerMenuActive, setIsHamburguerMenuActive] = useState(false);
    const { isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            setIsHamburguerMenuActive(false);
        };
    }, []);

    return (
        <header id='Header'>
            <section id='Header-Left-Container' className='Header-Child-Container'>
                <article id='Header-Brand-Container' onClick={() => navigate('/')}>
                    <i id='Header-Brand-Logo'></i>
                    <h1 id='Header-Brand-Title'>Quantum</h1>
                </article>
            </section>
            <section id='Header-Center-Container' className='Header-Child-Container'>
                <article id='Header-Links-Container'>
                    <IconLink title='Create Deployment' to='/repository/create/' />
                    <IconLink title='Privacy Policy' to='/legal/privacy-policy/' />
                    <IconLink title='Service Status' to='https://uptime.rodyherrera.com/' />
                </article>
            </section>
            <section id='Header-Right-Container' className='Header-Child-Container'>
                <article id='Header-Navigation-Container'>
                    {isAuthenticated ? (
                        <React.Fragment>
                            <HeaderNavItem title='Dashboard' to='/dashboard/' />
                            <HeaderNavItem title='Sign Out' onClick={() => logout(dispatch)} />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <HeaderNavItem title='Sign Up' to='/auth/sign-up/' />
                            <HeaderNavItem title='Log In' to='/auth/sign-in/' />
                        </React.Fragment>
                    )}
                    <HeaderNavItem id='Hamburguer-Menu-Container'>
                        <HamburguerMenu
                            onClick={() => setIsHamburguerMenuActive(!isHamburguerMenuActive)}
                            isactive={isHamburguerMenuActive.toString()} />
                    </HeaderNavItem>
                </article>
            </section>
        </header>
    );
};

export default Header;