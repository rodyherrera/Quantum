import { useSelector } from 'react-redux';
import { RootState } from '@services/store';
import Toast from '@components/atoms/Toast';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
    const toasts = useSelector((state: RootState) => state.toast.toasts);

    // TODO: do it better.
    const visibleToasts = toasts.slice(-1);

    return visibleToasts.length >= 1 && (
        <div className='Toast-Container'>
            {visibleToasts.map((toast) => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default ToastContainer;