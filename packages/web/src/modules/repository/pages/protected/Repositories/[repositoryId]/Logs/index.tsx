import { useParams } from 'react-router-dom';
import LogsTerminal from '@/shared/components/terminal/LogsTerminal';

const Logs = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    if(!repositoryId) return null;

    return (
        <LogsTerminal
            channelPath={`/repository/${repositoryId}/logs`}
            description='Output from the process serving this deployment.'
        />
    );
};

export default Logs;
