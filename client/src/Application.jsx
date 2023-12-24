import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@components/general/Layout';
import pages from '@pages';

const Application = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
                <Route index element={<pages.everybody.Home />} />

                <Route path='/auth/sign-up' element={<pages.guest.SignUp />} />
                <Route path='/auth/sign-in' element={<pages.guest.SignIn />} />
            </Route>
        </Routes>
    );
}

export default Application;