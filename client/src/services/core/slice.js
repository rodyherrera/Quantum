import { createSlice } from '@reduxjs/toolkit';

const state = {
    isMenuEnabled: false,
    isCloudConsoleEnabled: false,
    errors: [],
    isServerHealthLoading: true,
    serverHealth: null,
    error: null
};

const coreSlice = createSlice({
    name: 'core',
    initialState: state,
    reducers: {
        setIsMenuEnabled: (state, action) => {
            state.isMenuEnabled = action.payload;
        },
        setIsCloudConsoleEnabled: (state, action) => {
            state.isCloudConsoleEnabled = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setIsServerHealthLoading: (state, action) => {
            state.isServerHealthLoading = action.payload;
        },
        setServerHealth: (state, action) => {
            state.serverHealth = action.payload;
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
    setServerHealth,
    setIsServerHealthLoading,
    setError,
    setIsCloudConsoleEnabled,
    addError,
    removeError
} = coreSlice.actions;

export default coreSlice.reducer;