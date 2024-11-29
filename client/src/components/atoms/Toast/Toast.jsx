import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GrClose } from 'react-icons/gr';
import { removeToast } from '@services/core/toastSlice';
import './Toast.css'; 

const Toast = ({ toast }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if(toast?.persistent) return;
        const timer = setTimeout(() => {
            dispatch(removeToast(toast.id));
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [dispatch, toast.id, toast.duration]);

    return (
        <div className={`Toast ${toast.type}`}>
            <div className='Toast-Title-Container'>
                <div className='Toast-Title'>{toast.title}</div>
                <i className='Toast-Close-Icon-Container' onClick={() => dispatch(removeToast(toast.id))}>
                    <GrClose />
                </i>
            </div>
            <div className='Toast-Message'>{toast.message}</div>
        </div>
    );
};

const ToastContainer = () => {
    const toasts = useSelector((state) => state.toast.toasts);

    return toasts.length >= 1 && (
        <div className='Toast-Container'>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default ToastContainer;