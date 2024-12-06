import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeToast } from '@services/toast/slice';
import './Toast.css';

interface ToastProps{
    toast: {
        id: string;
        message: string;
        type?: 'success' | 'error' | 'info' | 'warning';
        duration?: number;
    };
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(toast.id));
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [dispatch, toast]);

    return (
        <div className={`Toast Toast-${toast.type}`}>
            <p className='Toast-Message'>{toast.message}</p>
        </div>
    );
};

export default Toast;