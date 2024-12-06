import React from 'react';
import ToastContainer from '@components/molecules/ToastContainer';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {

    return (
        <React.Fragment>
            <ToastContainer />
            <Outlet />
        </React.Fragment>
    );
};

export default Layout;