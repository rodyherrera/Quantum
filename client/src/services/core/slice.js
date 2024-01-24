import { createSlice } from '@reduxjs/toolkit';

const state = {
    isMenuEnabled: false
};

const coreSlice = createSlice({
    name: 'core',
    initialState: state,
    reducers: {
        setIsMenuEnabled: (state, action) => {
            state.isMenuEnabled = action.payload;
        }
    }
});

export const {
    setIsMenuEnabled
} = coreSlice.actions;

export default coreSlice.reducer;