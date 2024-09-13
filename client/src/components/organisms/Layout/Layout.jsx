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
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { authenticateWithCachedToken } from '@services/authentication/utils';
import { resetErrorForAllSlices } from '@services/core/operations';

import CloudShell from '@components/organisms/CloudShell';
import Waves from '@components/atoms/Waves';
import ClickSpark from '@components/atoms/ClickSpark';
import Banner from '@components/atoms/Banner';
import Header from '@components/organisms/Header';
import Menu from '@components/organisms/Menu';
import SquaredBackground from '@components/atoms/SquaredBackground';
import useWindowSize from '@hooks/useWindowSize';
import './Layout.css';

const Layout = () => {
    const { isAuthenticated, user, isLoading, isCacheLoading } = useSelector(state => state.auth);
    const { isLoading: githubIsLoading } = useSelector(state => state.github);
    const { isMenuEnabled, isCloudConsoleEnabled } = useSelector(state => state.core);
    const { width } = useWindowSize();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const bodyEl = document.getElementById('QuantumCloud-Body');
        const overflowValue = isMenuEnabled ? 'hidden' : 'unset';
        bodyEl.style.overflow = overflowValue;
    }, [isMenuEnabled]);

    useEffect(() => {
        dispatch(resetErrorForAllSlices());
    }, [location.pathname]);

    useEffect(() => {
        if(isAuthenticated) return;
        authenticateWithCachedToken(dispatch);
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        if(isAuthenticated && !user?.github?._id){
            navigate('/github/need-authenticate/');
        }
    }, [user, isLoading, isCacheLoading, githubIsLoading, isAuthenticated]);

    return (
        <React.Fragment>
            <ClickSpark />
            {isCloudConsoleEnabled && <CloudShell />}
            {isMenuEnabled && width <= 768 ? (
                <Menu />
            ) : (
                <React.Fragment>
                    <Banner text='We sprinkle magic to ease your production deployment. 🎉️' />
                    <Header />
                    <Outlet />
                    {width <= 768 && <Waves />}
                    <SquaredBackground />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default Layout;