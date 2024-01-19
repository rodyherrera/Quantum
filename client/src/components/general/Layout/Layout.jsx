import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authenticateWithCachedToken } from '@services/authentication/utils';
import Waves from '@components/general/Waves';
import ClickSpark from '@components/general/ClickSpark';
import Banner from '@components/general/Banner';
import Header from '@components/general/Header';
import Cursor from '@components/general/Cursor';
import SquaredBackground from '@components/general/SquaredBackground';
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
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        if(isAuthenticated && !user?.github?._id){
            navigate('/github/need-authenticate/');
        }
    }, [user, isLoading, isCacheLoading, githubIsLoading, isAuthenticated]);

    return (
        <Cursor>
            <ClickSpark />
            <SquaredBackground />
            <Banner text='We sprinkle magic to ease your production deployment. 🎉️' />
            <Header />
            <Outlet />
            <Waves />
        </Cursor>
    );
};

export default Layout;