import { createSlice } from '@reduxjs/toolkit';

export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
};

const initialState = {
    toasts: []
};

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action) => {
            const { title, message, type = TOAST_TYPES.INFO, duration = 3000, persistent = false } = action.payload;
            const id = Date.now();
            state.toasts.push({ id, message, type, duration, persistent, title });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        }
    }
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;