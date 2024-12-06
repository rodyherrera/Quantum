import './LoadingScreen.css';
import Loader from '@components/atoms/Loader';

interface LoadingScreenProps{
    message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {

    return (
        <div className='Loading-Screen-Container'>
            <Loader scale={0.7} />
            {message && <p className='Loading-Screen-Message'>{message}</p>}
        </div>
    );
};

export default LoadingScreen;