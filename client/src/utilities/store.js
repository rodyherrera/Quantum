import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@services/authentication/slice';

const store = configureStore({
    reducer: {
        auth: authReducer
    }
});

export default store;