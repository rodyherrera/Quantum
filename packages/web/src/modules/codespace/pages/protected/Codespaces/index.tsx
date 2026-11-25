import { useState, useMemo } from 'react';
import { PageSkeleton, TableSkeleton } from '@/shared/components/skeletons';
import { useRememberedSelection } from '@/shared/hooks/use-remembered-selection';
import { Button } from '@heroui/react';
import { Trash2 } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import ListRow from '@/shared/components/list/ListRow';
import ListPageShell from '@/shared/components/ListPageShell';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import EntitySelect from '@/shared/components/EntitySelect';
import CodespaceStatus from '@/modules/codespace/components/CodespaceStatus';
import CreateCodespaceDialog from '@/modules/codespace/components/CreateCodespaceDialog';
import CodespaceAccessDialog from '@/modules/codespace/components/CodespaceAccessDialog';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useResource } from '@/shared/hooks/api/use-resource';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { codespaceApi } from '@/modules/codespace/api/api';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { isCodespaceTransient } from '@/modules/codespace/utils/status';
import { codespaceErrorMessages } from '@/modules/codespace/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { formatBytes } from '@/shared/utils/format-bytes';
import { formatDate, formatDay } from '@/shared/utils/format-date';
import type { Codespace } from '@quantum/contracts/modules/codespace/domain';

const copy = errorCopy(codespaceErrorMessages);

const COLUMNS = 'grid-cols-[minmax(0,1fr)_auto_auto] md:grid-cols-[minmax(0,1fr)_7.5rem_minmax(0,14rem)_3.5rem_auto]';

const resourcesOf = (codespace: Codespace): string =>
    `${codespace.cpuCores} CPU · ${formatBytes(codespace.memoryMb * 1024 * 1024)} memory · ${codespace.diskGb} GB disk`;

interface DeleteCodespaceDialogProps{
    codespace: Codespace | null;
    onClose: () => void;
    onRemoved: () => void;
}

const DeleteCodespaceDialog = ({ codespace, onClose, onRemoved }: DeleteCodespaceDialogProps) => (
    <DeleteConfirmDialog
        isOpen={codespace !== null}
        title='Delete codespace'
        description={codespace === null
            ? ''
            : `This permanently removes "${codespace.name}" and its container. This action cannot be undone.`}
        entityId={codespace?.id ?? null}
        remove={(id) => codespaceApi.remove({ path: { id } })}
        getErrorMessage={copy}
        onClose={onClose}
        onRemoved={onRemoved}
    />
);

interface CodespaceRowProps{
    codespace: Codespace;
    onAccess: (codespace: Codespace) => void;
    onDelete: (codespace: Codespace) => void;
}

const CodespaceRow = ({ codespace, onAccess, onDelete }: CodespaceRowProps) => (
    <ListRow className={COLUMNS}>

        <span className='min-w-0 truncate'>
            <span className='font-medium text-foreground'>{codespace.name}</span>
            <span className='ml-2 hidden text-subtle sm:inline'>{resourcesOf(codespace)}</span>
        </span>

        <CodespaceStatus status={codespace.status} />

        <span title={codespace.accessUrl ?? undefined} className='hidden truncate font-mono text-xs text-muted md:block'>
            {codespace.accessUrl ?? '—'}
        </span>

        <time dateTime={codespace.createdAt} title={formatDate(codespace.createdAt)} className='hidden text-right text-xs tabular-nums text-subtle md:block'>
            {formatDay(codespace.createdAt)}
        </time>

        <span className='flex items-center justify-end gap-1'>
            <Button size='sm' variant='secondary' isDisabled={isCodespaceTransient(codespace.status)} onPress={() => onAccess(codespace)}>
                Access
            </Button>
            <Button isIconOnly size='sm' variant='ghost' aria-label={`Delete ${codespace.name}`} onPress={() => onDelete(codespace)}>
                <Trash2 aria-hidden='true' />
            </Button>
        </span>
    </ListRow>
);

const Codespaces = () => {
    const organizationId = useCurrentOrganizationId();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });
    const projectItemsIds = useMemo(() => (projects.data ?? []).map((entry) => entry.id), [projects.data]);
    const [projectId, setProjectId] = useRememberedSelection<number>('codespaces.project', projectItemsIds);

    const codespacesQuery = useQuery(
        (codespaceProjectId: number) => codespaceApi.listByProject({ path: { projectId: codespaceProjectId } }),
        [projectId ?? undefined],
        { enabled: projectId !== null }
    );
    const codespaces = usePolledQuery(codespacesQuery, {
        while: (data) => data.some((codespace) => isCodespaceTransient(codespace.status)),
        everyMs: 5000
    });

    const [createOpen, setCreateOpen] = useState(false);
    const [accessTarget, setAccessTarget] = useState<Codespace | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Codespace | null>(null);

    if(organizationId === null || projects.loading){
        return <PageSkeleton actions={1} columns={3} />;
    }

    const newCodespace = (
        <Button size='sm' aria-label='New codespace' isDisabled={projectId === null} onPress={() => setCreateOpen(true)}>
            <span className='sm:hidden'>New</span>
            <span className='hidden sm:inline'>New codespace</span>
        </Button>
    );

    return (
        <>
            <PageBar title='Codespaces' actions={projects.error === undefined ? newCodespace : undefined}>
                {projects.error === undefined ? (
                    <div className='w-32 py-1 pl-1 sm:w-44'>
                        <EntitySelect
                            items={projects.data ?? []}
                            getKey={(project) => project.id}
                            getLabel={(project) => project.name}
                            value={projectId}
                            onChange={(key) => setProjectId(Number(key))}
                            placeholder='Select a project'
                            ariaLabel='Project'
                        />
                    </div>
                ) : undefined}
            </PageBar>

            <PageBody variant='flush' fill>
                <ListPageShell
                    loading={projects.error === undefined && codespaces.loading}
                    skeleton={<TableSkeleton columns={3} />}
                    error={projects.error ?? codespaces.error}
                    errorTitle={projects.error === undefined ? 'Could not load codespaces' : 'Could not load projects'}
                    getErrorDescription={copy}
                    onRetry={projects.error === undefined ? codespaces.reload : projects.refresh}
                    showPrompt={projects.error === undefined && projectId === null}
                    prompt={{
                        title: 'Select a project',
                        description: 'Pick one of your projects to see its codespaces.'
                    }}
                    isEmpty={(codespaces.data ?? []).length === 0}
                    empty={{
                        title: 'No codespaces yet',
                        description: 'Create one to get a cloud dev environment for this project.',
                        action: (
                            <Button onPress={() => setCreateOpen(true)}>
                                New codespace
                            </Button>
                        )
                    }}
                >
                    <div>
                        {(codespaces.data ?? []).map((codespace) => (
                            <CodespaceRow key={codespace.id} codespace={codespace} onAccess={setAccessTarget} onDelete={setDeleteTarget} />
                        ))}
                    </div>
                </ListPageShell>
            </PageBody>

            {projectId !== null && (
                <CreateCodespaceDialog
                    projectId={projectId}
                    isOpen={createOpen}
                    onClose={setCreateOpen}
                    onCreated={codespaces.reload}
                />
            )}

            <CodespaceAccessDialog
                key={accessTarget?.id ?? 'access'}
                codespace={accessTarget}
                onClose={() => setAccessTarget(null)}
            />

            <DeleteCodespaceDialog
                codespace={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onRemoved={codespaces.reload}
            />
        </>
    );
};

export default Codespaces;
