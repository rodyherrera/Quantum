import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnvVariables } from '@services/env/api';

interface EnvState{
    environVariables: EnvVariables;
}

const initialState: EnvState = {
    environVariables: {}
};

const envSlice = createSlice({
    name: 'env',
    initialState,
    reducers: {
        setEnvironVariables(state, action: PayloadAction<EnvVariables>) {
            state.environVariables = action.payload;
        }
    }
});

export const { setEnvironVariables } = envSlice.actions;

export default envSlice.reducer;
