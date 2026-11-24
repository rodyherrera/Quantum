import { useState, useMemo } from 'react';
import { PageSkeleton, TableSkeleton } from '@/shared/components/skeletons';
import { useRememberedSelection } from '@/shared/hooks/use-remembered-selection';
import { Button, Table } from '@heroui/react';
import { Plus, Terminal } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import ListPageShell from '@/shared/components/ListPageShell';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import EntitySelect from '@/shared/components/EntitySelect';
import CodespaceStatusChip from '@/modules/codespace/components/CodespaceStatus';
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
import type { Codespace } from '@quantum/contracts/modules/codespace/domain';

const copy = errorCopy(codespaceErrorMessages);

interface CodespacesHeaderProps{
    canAdd: boolean;
    onAdd: () => void;
}

const CodespacesHeader = ({ canAdd, onAdd }: CodespacesHeaderProps) => (
    <PageHeader
        title='Codespaces'
        description='Cloud dev environments for a project.'
        actions={(
            <Button isDisabled={!canAdd} onPress={onAdd}>
                <Plus aria-hidden='true' className='size-4' />
                New codespace
            </Button>
        )}
    />
);

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

interface CodespacesTableProps{
    codespaces: Codespace[];
    onAccess: (codespace: Codespace) => void;
    onDelete: (codespace: Codespace) => void;
}

const CodespacesTable = ({ codespaces, onAccess, onDelete }: CodespacesTableProps) => (
    <Table>
        <Table.ScrollContainer>
            <Table.Content aria-label='Codespaces'>
                <Table.Header>
                    <Table.Column isRowHeader>Name</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column><span className='sr-only'>Actions</span></Table.Column>
                </Table.Header>

                <Table.Body>
                    {codespaces.map((codespace) => (
                        <Table.Row key={codespace.id}>
                            <Table.Cell><span className='font-medium text-foreground'>{codespace.name}</span></Table.Cell>
                            <Table.Cell><CodespaceStatusChip status={codespace.status} /></Table.Cell>
                            <Table.Cell>
                                <div className='flex justify-end gap-2'>
                                    <Button
                                        size='sm'
                                        variant='secondary'
                                        isDisabled={isCodespaceTransient(codespace.status)}
                                        onPress={() => onAccess(codespace)}
                                    >
                                        Access
                                    </Button>
                                    <Button size='sm' variant='danger-soft' onPress={() => onDelete(codespace)}>Delete</Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
    </Table>
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

    if(organizationId === null || projects.loading || projects.error !== undefined){
        return (
            <ListPageShell
                bare
                loading={organizationId === null || projects.loading}
                skeleton={<PageSkeleton actions={1} columns={3} />}
                error={organizationId === null ? undefined : projects.error}
                errorTitle='Could not load projects'
                getErrorDescription={copy}
                onRetry={projects.refresh}
            />
        );
    }

    const projectItems = projects.data ?? [];

    return (
        <PageBody fill>
            <CodespacesHeader canAdd={projectId !== null} onAdd={() => setCreateOpen(true)} />

            <div className='mt-6 max-w-sm'>
                <EntitySelect
                    items={projectItems}
                    getKey={(project) => project.id}
                    getLabel={(project) => project.name}
                    value={projectId}
                    onChange={(key) => setProjectId(Number(key))}
                    placeholder='Select a project'
                    ariaLabel='Project'
                />
            </div>

            <div className='mt-6 flex flex-1 flex-col'>
                <ListPageShell
                    loading={codespaces.loading}
                    skeleton={<TableSkeleton columns={3} />}
                    error={codespaces.error}
                    errorTitle='Could not load codespaces'
                    getErrorDescription={copy}
                    onRetry={codespaces.reload}
                    showPrompt={projectId === null}
                    prompt={{
                        icon: Terminal,
                        title: 'Select a project',
                        description: 'Choose one of your projects above to view and manage its codespaces.'
                    }}
                    isEmpty={(codespaces.data ?? []).length === 0}
                    empty={{
                        icon: Terminal,
                        title: 'No codespaces yet',
                        description: 'This project has no codespaces. Create one to get a cloud dev environment.',
                        action: (
                            <Button onPress={() => setCreateOpen(true)}>
                                <Plus aria-hidden='true' className='size-4' />
                                New codespace
                            </Button>
                        )
                    }}
                >
                    <CodespacesTable
                        codespaces={codespaces.data ?? []}
                        onAccess={setAccessTarget}
                        onDelete={setDeleteTarget}
                    />
                </ListPageShell>
            </div>

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
        </PageBody>
    );
};

export default Codespaces;
