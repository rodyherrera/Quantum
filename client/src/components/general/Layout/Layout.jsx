import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@services/authentication/actions';
import { authenticateWithCachedToken } from '@services/authentication/utils';
import HeaderNavItem from '@components/general/HeaderNavItem';
import HeaderLink from '@components/general/HeaderLink';
import './Layout.css';

const Layout = () => {
    const { isAuthenticated, user, isLoading, isCacheLoading } = useSelector(state => state.auth);
    const { isLoading: githubIsLoading } = useSelector(state => state.github);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if(!isAuthenticated){
            authenticateWithCachedToken(dispatch);
        }
    }, []);

    useEffect(() => {
        if(isAuthenticated && !user?.github?._id)
            navigate('/github/need-authenticate/');
    }, [user, isLoading, isCacheLoading, githubIsLoading, isAuthenticated]);

    return (
        <React.Fragment>
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
                    </article>
                </section>
            </header>

            <Outlet />
        </React.Fragment>
    );
};

export default Layout;