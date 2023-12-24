import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthenticationContext } from '../../../services/authentication/context';
import { useSelector } from 'react-redux';
import Button from '@components/general/Button';
import './Layout.css';

const Layout = () => {
    const { logout } = useContext(AuthenticationContext);
    const { isAuthenticated } = useSelector(state => state.authentication);

    return (
        <React.Fragment>
            <header id='Header'>
                <section id='Header-Left-Container' className='Header-Child-Container'>
                    <article id='Header-Brand-Container'>
                        <i id='Header-Brand-Logo'></i>
                        <h1 id='Header-Brand-Title'>Quantum</h1>
                    </article>
                </section>
                <section id='Header-Right-Container' className='Header-Child-Container'>
                    <article id='Header-Navigation-Container'>
                        {isAuthenticated ? (
                            <Button title='Logout' onClick={logout} />
                        ) : (
                            <React.Fragment>
                                <Button title='Sign Up' to='/auth/sign-up' />
                                <Button title='Sign In' variant='Contained' to='/auth/sign-in/' />
                            </React.Fragment>
                        )}
                    </article>
                </section>
            </header>

            <Outlet />
        </React.Fragment>
    );
};

export default Layout;