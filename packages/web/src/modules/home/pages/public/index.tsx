import { Navigate } from 'react-router-dom';
import Landing from '@/modules/home/components/Landing';
import { useSessionStore } from '@/shared/store/session';

const Welcome = () => {
    const token = useSessionStore((state) => state.token);

    if(token !== null) return <Navigate to='/applications' replace />;

    return <Landing />;
};

export default Welcome;
