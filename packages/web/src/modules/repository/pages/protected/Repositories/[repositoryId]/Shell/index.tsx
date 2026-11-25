import { useParams } from 'react-router-dom';
import ShellTerminal from '@/shared/components/terminal/ShellTerminal';

const Shell = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    if(!repositoryId) return null;

    return (
        <ShellTerminal
            channelPath={`/repository/${repositoryId}/terminal`}
            description={`Interactive terminal session for repository #${repositoryId}.`}
        />
    );
};

export default Shell;
