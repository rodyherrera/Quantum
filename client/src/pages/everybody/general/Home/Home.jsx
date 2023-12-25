import React from 'react';
import { useSelector } from 'react-redux';
import { authenticate } from '@services/github/actions';

const HomePage = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    return (
        <main id='Home-Page-Main'>
        </main>
    );
};

export default HomePage;