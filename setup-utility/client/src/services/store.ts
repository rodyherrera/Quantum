import { configureStore } from '@reduxjs/toolkit';
import envReducer from '@services/env/slice';

export const store = configureStore({
    reducer: {
        env: envReducer
    }
});

export default store;