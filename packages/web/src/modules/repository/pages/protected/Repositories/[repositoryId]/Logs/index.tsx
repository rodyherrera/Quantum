import { useParams } from 'react-router-dom';
import LogsTerminal from '@/shared/components/terminal/LogsTerminal';

const Logs = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    if(!repositoryId) return null;

    return (
        <div className='flex min-h-[28rem] flex-1 flex-col'>
            <LogsTerminal
                channelPath={`/repository/${repositoryId}/logs`}
                description='Output from the process serving this deployment.'
            />
        </div>
    );
};

export default Logs;
