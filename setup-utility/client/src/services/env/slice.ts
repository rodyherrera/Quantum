import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    environVariables: {}
};

const envSlice = createSlice({
    name: 'env',
    initialState,
    reducers: {
        setEnvironVariables(state, action) {
            state.environVariables = action.payload;
        }
    }
});

export const { setEnvironVariables } = envSlice.actions;

export default envSlice.reducer;