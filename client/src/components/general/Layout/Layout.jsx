import React from 'react';
import { Outlet } from 'react-router-dom';
import Button from '@components/general/Button';
import './Layout.css';

const Layout = () => {

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
                        <Button title='Sign Up' to='/auth/sign-up' />
                        <Button title='Sign In' variant='Contained' to='/auth/sign-in/' />
                    </article>
                </section>
            </header>

            <Outlet />
        </React.Fragment>
    );
};

export default Layout;