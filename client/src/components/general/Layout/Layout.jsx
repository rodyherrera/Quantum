import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authenticateWithCachedToken } from '@services/authentication/utils';
import Waves from '@components/general/Waves';
import ClickSpark from '@components/general/ClickSpark';
import Banner from '@components/general/Banner';
import Header from '@components/general/Header';
import Menu from '@components/general/Menu';
import SquaredBackground from '@components/general/SquaredBackground';
import useWindowSize from '@hooks/useWindowSize';
import './Layout.css';

const Layout = () => {
    const { isAuthenticated, user, isLoading, isCacheLoading } = useSelector(state => state.auth);
    const { isLoading: githubIsLoading } = useSelector(state => state.github);
    const { isMenuEnabled } = useSelector(state => state.core);
    const { width } = useWindowSize();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const bodyEl = document.getElementById('QuantumCloud-Body');
        if(!isMenuEnabled){
            bodyEl.style.overflow = 'unset';
            return;
        }
        bodyEl.style.overflow = 'hidden';
    }, [isMenuEnabled]);

    useEffect(() => {
        if(!isAuthenticated){
            authenticateWithCachedToken(dispatch);
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        if(isAuthenticated && !user?.github?._id){
            navigate('/github/need-authenticate/');
        }
    }, [user, isLoading, isCacheLoading, githubIsLoading, isAuthenticated]);

    return (
        <React.Fragment>
            {(isMenuEnabled && width <= 768) && (
                <Menu />
            )}
            <ClickSpark />
            <SquaredBackground />
            <Banner text='We sprinkle magic to ease your production deployment. 🎉️' />
            <Header />
            <Outlet />
            <Waves />
        </React.Fragment>
    );
};

export default Layout;