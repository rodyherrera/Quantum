import React from 'react';
import { useSelector } from 'react-redux';
import { authenticate } from '@services/github/actions';

const HomePage = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);

    return (
        <main id='Home-Page-Main'>
            {(isAuthenticated && !user?.github?._id) && (
                <div>
                    <button onClick={() => authenticate(user._id)}>Authenticate</button>
                </div>
            )}
        </main>
    );
};

export default HomePage;