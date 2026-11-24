import { Button } from '@heroui/react';
import { ArrowRight, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScreenMessage from '@/shared/components/ScreenMessage';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <ScreenMessage icon={Compass} title='Page not found' description='The page you are looking for doesn’t exist or may have moved.'>
            <Button className='mt-6' onPress={() => navigate('/applications')}>
                Back to Applications
                <ArrowRight aria-hidden='true' />
            </Button>
        </ScreenMessage>
    );
};

export default NotFound;
