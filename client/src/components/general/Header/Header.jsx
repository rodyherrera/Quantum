import React, { useEffect, useState } from 'react';
import HeaderNavItem from '@components/general/HeaderNavItem';
import HeaderLink from '@components/general/HeaderLink';
import HamburguerMenu from '@components/general/HamburguerMenu';
import { logout } from '@services/authentication/actions';
import { useSelector } from 'react-redux';
import './Header.css';

const Header = () => {
    const [isHamburguerMenuActive, setIsHamburguerMenuActive] = useState(false);
    const { isAuthenticated } = useSelector(state => state.auth);

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
                    <HeaderLink title='Create Deployment' to='/repository/create/' />
                    <HeaderLink title='Terms & Privacy' to='/' />
                    <HeaderLink title='Service Status' to='/' />
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