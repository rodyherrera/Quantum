import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@services/authentication/slice';
import githubReducer from '@services/github/slice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        github: githubReducer
    }
});

export default store;