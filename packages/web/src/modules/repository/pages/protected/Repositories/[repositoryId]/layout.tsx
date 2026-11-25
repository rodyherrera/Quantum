import { Outlet, useParams } from 'react-router-dom';
import { DetailSkeleton } from '@/shared/components/skeletons';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import DetailView from '@/shared/components/detail/DetailView';
import DetailHeader from '@/shared/components/detail/DetailHeader';
import TabNav from '@/shared/components/detail/TabNav';
import CenterState from '@/shared/components/CenterState';
import ErrorState from '@/shared/components/ErrorState';
import StatusText from '@/shared/components/StatusText';
import InlineEdit from '@/shared/components/InlineEdit';
import InlineError from '@/shared/components/InlineError';
import WorkspaceButton from '@/modules/codespace/components/WorkspaceButton';
import PortLinks from '@/modules/repository/components/PortLinks';
import RepositoryProperties from '@/modules/repository/components/RepositoryProperties';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { useQuery } from '@/shared/hooks/api/use-query';
import { repositoryApi } from '@/modules/repository/api/api';
import {
    containerStatusColor,
    containerStatusLabel
} from '@/modules/application/utils/container-status';
import { displayName, sourcePath } from '@/modules/repository/utils/repository-display';
import { repositoryDetailErrorMessages } from '@/modules/repository/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import type { Crumb } from '@/shared/components/layout/PageBar';
import type { TabNavItem } from '@/shared/components/detail/TabNav';
import type { Repository } from '@quantum/contracts/modules/repository/domain';

const copy = errorCopy(repositoryDetailErrorMessages);

const TRAIL: Crumb[] = [{ label: 'Applications', to: '/applications' }];

const TABS: TabNavItem[] = [
    { label: 'Deployments', to: 'deployments' },
    { label: 'Environment', to: 'environment-variables' },
    { label: 'Logs', to: 'logs' },
    { label: 'Shell', to: 'shell' },
    { label: 'Settings', to: 'settings' }
];

interface RepositoryHeaderProps{
    repository: Repository;
    renameError: Error | undefined;
    onRename: (name: string) => Promise<unknown>;
}

const RepositoryHeader = ({ repository, renameError, onRename }: RepositoryHeaderProps) => (
    <DetailHeader
        title={(
            <InlineEdit
                value={displayName(repository)}
                ariaLabel='Repository name'
                onCommit={onRename}
                className='-mx-1 rounded-md px-1 transition-colors hover:bg-default focus-visible:bg-default motion-reduce:transition-none'
            />
        )}
        error={renameError === undefined ? undefined : <InlineError>{copy(renameError)}</InlineError>}
        meta={(
            <>
                <StatusText color={containerStatusColor(repository.containerStatus)} label={containerStatusLabel(repository.containerStatus)} />

                {repository.framework !== null && <span>{repository.framework}</span>}

                <span className='truncate font-mono text-xs'>{repository.branch}</span>

                <a
                    href={repository.url}
                    target='_blank'
                    rel='noreferrer'
                    title={repository.url}
                    className='truncate underline-offset-2 transition-colors hover:text-foreground hover:underline motion-reduce:transition-none'
                >
                    {sourcePath(repository.url)}
                </a>

                {repository.ports.length > 0 && <PortLinks ports={repository.ports} />}
            </>
        )}
        actions={<WorkspaceButton target={{ kind: 'repository', id: repository.id }} />}
    />
);

const RepositoryLayout = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    const id = repositoryId !== undefined ? Number(repositoryId) : undefined;

    const repository = useQuery((repositoryId: number) => repositoryApi.get({ path: { id: repositoryId } }), [id]);
    const rename = useMutation((targetId: number, name: string) => repositoryApi.update({ path: { id: targetId }, body: { name } }), {
        onSuccess: () => repository.reload()
    });

    if(repository.loading && repository.data === null){
        return (
            <>
                <PageBar title='Repository' trail={TRAIL} />
                <DetailSkeleton actions={1} tabs={TABS.length} />
            </>
        );
    }

    if(repository.error !== undefined){
        return (
            <>
                <PageBar title='Repository' trail={TRAIL} />
                <CenterState>
                    <ErrorState
                        title='Could not load repository'
                        description={copy(repository.error)}
                        onRetry={repository.reload}
                    />
                </CenterState>
            </>
        );
    }

    if(repository.data === null || id === undefined) return null;

    return (
        <>
            <PageBar title={displayName(repository.data)} trail={TRAIL} />

            <DetailView
                header={<RepositoryHeader repository={repository.data} renameError={rename.error} onRename={(name) => rename.run(id, name)} />}
                tabs={<TabNav label='Repository' items={TABS} />}
                rail={<RepositoryProperties repository={repository.data} />}
            >
                <PageBody fill>
                    <Outlet />
                </PageBody>
            </DetailView>
        </>
    );
};

export default RepositoryLayout;
