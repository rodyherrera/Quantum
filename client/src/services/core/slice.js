import { createSlice } from '@reduxjs/toolkit';

const state = {
    isMenuEnabled: false,
    errors: []
};

const coreSlice = createSlice({
    name: 'core',
    initialState: state,
    reducers: {
        setIsMenuEnabled: (state, action) => {
            state.isMenuEnabled = action.payload;
        },
        addError: (state, action) => {
            const error = action.payload;
            state.errors.push(error);
        },
        removeError: (state, action) => {
            const errorId = action.payload;
            state.errors = state.errors.filter((error) => error.id !== errorId);
        }
    }
});

export const {
    setIsMenuEnabled,
    addError,
    removeError
} = coreSlice.actions;

export default coreSlice.reducer;