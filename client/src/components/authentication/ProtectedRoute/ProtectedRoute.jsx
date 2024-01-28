import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import './ProtectedRoute.css';

const ProtectedRoute = ({ mode, restrictTo = undefined }) => {
    const { isCachedAuthLoading, isAuthenticated, user } = useSelector(state => state.auth);
    const location = useLocation();

    return (isCachedAuthLoading) ? (
        <main className='Authentication-Loading-Main'>
            <CircularProgress className='Circular-Progress' />
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