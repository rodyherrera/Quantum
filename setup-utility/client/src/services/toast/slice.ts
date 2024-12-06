import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
}

interface ToastState{
    toasts: Toast[];
}

const initialState: ToastState = {
    toasts: []
};

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<Toast>) => {
            state.toasts.push(action.payload);
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
        clearToasts: (state) => {
            state.toasts = [];
        }
    }
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;