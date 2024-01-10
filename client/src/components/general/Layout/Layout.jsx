import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authenticateWithCachedToken } from '@services/authentication/utils';
import Waves from '@components/general/Waves';
import Header from '@components/general/Header';
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
        <React.Fragment>
            <Header />
            <Outlet />
            <Waves />
        </React.Fragment>
    );
};

export default Layout;