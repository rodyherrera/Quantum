/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * Source code for Sandrino Aguilar - Web platform, presence of 
 * a company dedicated to accounting services.
 * 
 * (www.sandrinoaguilar.com)
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 ****/

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import './ProtectedRoute.css';

const ProtectedRoute = ({ mode, restrictTo = undefined }) => {
    const { isCachedAuthenticationLoading, isAuthenticated, user } = useSelector(state => state.authentication);
    const location = useLocation();

    return (isCachedAuthenticationLoading) ? (
        <main id='Authentication-Loading-Main'>
            <CircularProgress size={'2.5rem'} />
        </main>
    ) : restrictTo !== undefined ? (
        user && user.Role.toLowerCase().includes(restrictTo.toLowerCase()) ?
            (<Outlet />) : (<Navigate to='/' />)
    ) : mode === 'protect' ? (
        !isAuthenticated ? 
            (<Navigate to='/auth/sign-in/' state={{ from: location }} />) : (<Outlet />)
    ) : isAuthenticated ? 
        (<Navigate to='/' state={{ from: location }} />) : (<Outlet />)
};

export default ProtectedRoute;