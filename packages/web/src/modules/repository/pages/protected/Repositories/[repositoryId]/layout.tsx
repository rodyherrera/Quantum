import { Outlet, useParams } from 'react-router-dom';
import { DetailSkeleton } from '@/shared/components/skeletons';
import { ArrowUpRight, GitBranch, KeyRound, Rocket, ScrollText, SlidersHorizontal, SquareTerminal, Zap } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import DetailView from '@/shared/components/detail/DetailView';
import DetailHeader from '@/shared/components/detail/DetailHeader';
import DetailIcon from '@/shared/components/detail/DetailIcon';
import TabNav from '@/shared/components/detail/TabNav';
import CenterState from '@/shared/components/CenterState';
import ErrorState from '@/shared/components/ErrorState';
import StatusDot from '@/shared/components/StatusDot';
import InlineEdit from '@/shared/components/InlineEdit';
import InlineError from '@/shared/components/InlineError';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import WorkspaceButton from '@/modules/codespace/components/WorkspaceButton';
import PortLinks from '@/modules/repository/components/PortLinks';
import RepositoryProperties from '@/modules/repository/components/RepositoryProperties';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { useQuery } from '@/shared/hooks/api/use-query';
import { repositoryApi } from '@/modules/repository/api/api';
import {
    containerStatusColor,
    containerStatusLabel,
    isContainerTransient
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
    { label: 'Deployments', to: 'deployments', icon: Rocket },
    { label: 'Environment', to: 'environment-variables', icon: KeyRound },
    { label: 'Logs', to: 'logs', icon: ScrollText },
    { label: 'Shell', to: 'shell', icon: SquareTerminal },
    { label: 'Settings', to: 'settings', icon: SlidersHorizontal }
];

const metaItemClass = 'inline-flex min-w-0 items-center gap-1.5';

interface RepositoryHeaderProps{
    repository: Repository;
    renameError: Error | undefined;
    onRename: (name: string) => Promise<unknown>;
}

const RepositoryHeader = ({ repository, renameError, onRename }: RepositoryHeaderProps) => (
    <DetailHeader
        icon={<DetailIcon><GithubIcon /></DetailIcon>}
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
                <StatusDot
                    color={containerStatusColor(repository.containerStatus)}
                    label={containerStatusLabel(repository.containerStatus)}
                    isTransient={isContainerTransient(repository.containerStatus)}
                />

                {repository.framework !== null && (
                    <span className={metaItemClass}>
                        <Zap aria-hidden='true' className='size-3.5 text-subtle' />
                        {repository.framework}
                    </span>
                )}

                <span className={metaItemClass}>
                    <GitBranch aria-hidden='true' className='size-3.5 text-subtle' />
                    <span className='truncate font-mono text-xs'>{repository.branch}</span>
                </span>

                <a
                    href={repository.url}
                    target='_blank'
                    rel='noreferrer'
                    title={repository.url}
                    className={`${metaItemClass} transition-colors hover:text-foreground motion-reduce:transition-none`}
                >
                    <GithubIcon className='size-3.5 shrink-0 text-subtle' />
                    <span className='truncate'>{sourcePath(repository.url)}</span>
                    <ArrowUpRight aria-hidden='true' className='size-3 text-subtle' />
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
                <PageBar title='Repository' icon={GitBranch} trail={TRAIL} />
                <DetailSkeleton actions={1} tabs={TABS.length} />
            </>
        );
    }

    if(repository.error !== undefined){
        return (
            <>
                <PageBar title='Repository' icon={GitBranch} trail={TRAIL} />
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
            <PageBar title={displayName(repository.data)} icon={GitBranch} trail={TRAIL} />

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
