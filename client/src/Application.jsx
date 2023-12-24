import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Pages from '@Pages';

const Application = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route index element={<Pages.Everybody.Home />} />
        </Routes>
    );
}

export default Application;