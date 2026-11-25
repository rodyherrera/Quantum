import { useParams } from 'react-router-dom';
import ShellTerminal from '@/shared/components/terminal/ShellTerminal';

const Shell = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    if(!repositoryId) return null;

    return (
        <div className='flex min-h-[28rem] flex-1 flex-col'>
            <ShellTerminal
                channelPath={`/repository/${repositoryId}/terminal`}
                description={`Interactive terminal session for repository #${repositoryId}.`}
            />
        </div>
    );
};

export default Shell;
