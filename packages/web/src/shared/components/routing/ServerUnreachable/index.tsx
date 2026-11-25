import { Button } from '@heroui/react';
import ScreenMessage from '@/shared/components/ScreenMessage';

interface ServerUnreachableProps{
    onRetry: () => void;
}

const ServerUnreachable = ({ onRetry }: ServerUnreachableProps) => (
    <ScreenMessage
        title='We cannot reach the server'
        description='Your session is still here. The server is not answering, so nothing was lost. Try again once it is back.'
    >
        <Button className='mt-6' onPress={onRetry}>Try again</Button>
    </ScreenMessage>
);

export default ServerUnreachable;
