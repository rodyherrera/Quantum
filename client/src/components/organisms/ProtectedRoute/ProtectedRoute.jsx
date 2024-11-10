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
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '@components/atoms/Loader';
import './ProtectedRoute.css';

const ProtectedRoute = ({ mode, restrictTo = undefined }) => {
    const { authStatus, user } = useSelector(state => state.auth);
    const location = useLocation();

    return (authStatus.isCachedAuthLoading) ? (
        <main className='Authentication-Loading-Main'>
            <Loader scale='0.7' />
        </main>
    ) : restrictTo !== undefined ? (
        user && user.Role.toLowerCase().includes(restrictTo.toLowerCase()) ?
            (<Outlet />) : (<Navigate to='/' />)
    ) : mode === 'protect' ? (
        !authStatus.isAuthenticated ? 
            (<Navigate to='/auth/sign-in/' state={{ from: location }} />) : (<Outlet />)
    ) : authStatus.isAuthenticated ? 
        (<Navigate to='/' state={{ from: location }} />) : (<Outlet />)
};

export default ProtectedRoute;