import './LoadingScreen.css';
import Loader from '@components/atoms/Loader';

const LoadingScreen = ({ message }) => {

    return (
        <div className='Loading-Screen-Container'>
            <Loader scale='0.7' />
            {message && <p className='Loading-Screen-Message'>{message}</p>}
        </div>
    );
};

export default LoadingScreen;