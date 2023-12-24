import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@components/general/Layout';
import ProtectedRoute from '@components/authentication/ProtectedRoute';
import pages from '@pages';

const Application = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
                <Route index element={<pages.everybody.Home />} />

                <Route element={<ProtectedRoute mode='guest' />}>
                    <Route path='/auth/sign-up' element={<pages.guest.SignUp />} />
                    <Route path='/auth/sign-in' element={<pages.guest.SignIn />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default Application;