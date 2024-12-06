import { useSelector } from 'react-redux';
import { RootState } from '@services/store';
import Toast from '@components/atoms/Toast';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
    const toasts = useSelector((state: RootState) => state.toast.toasts);

    return toasts.length >= 1 && (
        <div className='Toast-Container'>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} />
            ))}
        </div>
    );
};

export default ToastContainer;