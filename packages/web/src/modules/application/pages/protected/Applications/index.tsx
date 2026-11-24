import { useEffect, useState } from 'react';
import { LinesSkeleton, PageSkeleton, TableSkeleton } from '@/shared/components/skeletons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Label, ListBox, ListBoxItem, Select, TextField } from '@heroui/react';
import { AppWindow, Plus } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import ListPageShell from '@/shared/components/ListPageShell';
import ErrorState from '@/shared/components/ErrorState';
import CenterState from '@/shared/components/CenterState';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import Modal from '@/shared/components/Modal';
import InlineError from '@/shared/components/InlineError';
import ApplicationsHeader from '@/modules/application/components/ApplicationsHeader';
import ApplicationsFilters from '@/modules/application/components/ApplicationsFilters';
import ApplicationsList from '@/modules/application/components/ApplicationsList';
import ConnectionStringField from '@/modules/database/components/ConnectionStringField';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { repositoryApi } from '@/modules/repository/api/api';
import { databaseApi } from '@/modules/database/api/api';
import { templateInstallApi } from '@/modules/template/api/api';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';
import { repositoryRoutes } from '@quantum/contracts/modules/repository/routes';
import { templateInstallRoutes } from '@quantum/contracts/modules/template/routes';
import { isInstallTransient } from '@/modules/template/utils/install-status';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { isDatabaseTransient } from '@/modules/application/utils/status';
import { buildRows, kindOf } from '@/modules/application/utils/application-rows';
import { formatDate } from '@/shared/utils/format-date';
import { applicationErrorMessages } from '@/modules/application/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { DatabaseEngine } from '@quantum/contracts/modules/database/domain';
import type { KindFilter } from '@/modules/application/components/ApplicationsHeader';
import type { Row } from '@/modules/application/utils/application-rows';
import type { TemplateInstallOperation } from '@quantum/contracts/modules/template/http';
import type { Database } from '@quantum/contracts/modules/database/domain';
import type { CreateDatabaseInput } from '@quantum/contracts/modules/database/http';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const copy = errorCopy(applicationErrorMessages);

const ENGINE_LABEL: Record<DatabaseEngine, string> = {
    [DatabaseEngine.Postgres]: 'PostgreSQL',
    [DatabaseEngine.Mysql]: 'MySQL',
    [DatabaseEngine.Mariadb]: 'MariaDB',
    [DatabaseEngine.Mongodb]: 'MongoDB',
    [DatabaseEngine.Redis]: 'Redis'
};

const ENGINES = Object.values(DatabaseEngine);

interface DeleteApplicationDialogProps{
    repository: Repository | null;
    onClose: () => void;
    onRemoved: () => void;
}

const DeleteApplicationDialog = ({ repository, onClose, onRemoved }: DeleteApplicationDialogProps) => (
    <DeleteConfirmDialog
        isOpen={repository !== null}
        title='Delete application'
        description={repository === null
            ? ''
            : `This permanently removes "${repository.name}" and its deployments. This action cannot be undone.`}
        entityId={repository?.id ?? null}
        remove={(id) => repositoryApi.remove({ path: { id } })}
        getErrorMessage={copy}
        onClose={onClose}
        onRemoved={onRemoved}
    />
);

interface CreateDatabaseDialogProps{
    projectId: number | null;
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    onCreated: () => void;
}

const CreateDatabaseDialog = ({ projectId, isOpen, onClose, onCreated }: CreateDatabaseDialogProps) => {
    const [name, setName] = useState('');
    const [engine, setEngine] = useState<DatabaseEngine>(DatabaseEngine.Postgres);
    const [version, setVersion] = useState('');
    const create = useMutation((targetProjectId: number, body: CreateDatabaseInput) =>
        databaseApi.create({ path: { projectId: targetProjectId }, body }));

    const reset = () => {
        setName('');
        setEngine(DatabaseEngine.Postgres);
        setVersion('');
    };

    const handleClose = () => {
        if(create.loading) return;
        reset();
        onClose(false);
    };

    const handleCreate = async () => {
        if(projectId === null || name.trim() === '') return;

        const created = await create
            .run(projectId, { name: name.trim(), engine, version: version.trim() === '' ? undefined : version.trim() })
            .then(() => true, () => false);

        if(!created) return;
        reset();
        onClose(false);
        onCreated();
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => { if(!open) handleClose(); }} title='New database'>
            <div className='flex flex-col gap-4'>
                <TextField value={name} onChange={setName} isDisabled={create.loading} validationBehavior='aria' fullWidth>
                    <Label>Name</Label>
                    <Input placeholder='my-database' autoComplete='off' />
                </TextField>

                <div className='flex flex-col gap-1.5'>
                    <Label>Engine</Label>
                    <Select
                        aria-label='Engine'
                        selectedKey={engine}
                        isDisabled={create.loading}
                        onSelectionChange={(key) => setEngine(key as DatabaseEngine)}
                    >
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>

                        <Select.Popover>
                            <ListBox>
                                {ENGINES.map((value) => (
                                    <ListBoxItem key={value} id={value} textValue={ENGINE_LABEL[value]}>
                                        {ENGINE_LABEL[value]}
                                    </ListBoxItem>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>

                <TextField value={version} onChange={setVersion} isDisabled={create.loading} validationBehavior='aria' fullWidth>
                    <Label>Version (optional)</Label>
                    <Input placeholder='latest' autoComplete='off' />
                </TextField>

                {create.error !== undefined && <InlineError>{copy(create.error)}</InlineError>}

                <div className='flex justify-end gap-2'>
                    <Button variant='secondary' isDisabled={create.loading} onPress={handleClose}>Cancel</Button>
                    <Button isPending={create.loading} isDisabled={name.trim() === ''} onPress={() => { void handleCreate(); }}>
                        Create
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

interface ConnectionStringDialogProps{
    database: Database | null;
    onClose: () => void;
}

const ConnectionStringDialog = ({ database, onClose }: ConnectionStringDialogProps) => {
    const connectionString = useQuery((connectionStringId: number) => databaseApi.connectionString({ path: { id: connectionStringId } }), [database?.id], { enabled: database !== null });

    return (
        <Modal
            isOpen={database !== null}
            onOpenChange={(isOpen) => { if(!isOpen) onClose(); }}
            title={database === null ? 'Connection string' : `Connection string · ${database.name}`}
        >
            <div className='flex flex-col gap-4'>
                {connectionString.loading && <LinesSkeleton lines={2} />}

                {!connectionString.loading && connectionString.error !== undefined && (
                    <div className='flex flex-col gap-2'>
                        <InlineError>{copy(connectionString.error)}</InlineError>
                        <Button variant='secondary' onPress={connectionString.reload}>Try again</Button>
                    </div>
                )}

                {!connectionString.loading && connectionString.error === undefined && connectionString.data !== null && (
                    <ConnectionStringField value={connectionString.data.connectionString} />
                )}

                <div className='flex justify-end'>
                    <Button variant='secondary' onPress={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

interface RestoreDatabaseDialogProps{
    database: Database | null;
    onClose: () => void;
    onRestored: () => void;
}

const RestoreDatabaseDialog = ({ database, onClose, onRestored }: RestoreDatabaseDialogProps) => {
    const [backupId, setBackupId] = useState<string | null>(null);
    const restore = useMutation((id: number, backup: string) => databaseApi.restore({ path: { id }, body: { backupId: backup } }));

    const backups = database?.backups ?? [];

    const handleClose = () => {
        if(restore.loading) return;
        setBackupId(null);
        onClose();
    };

    const handleRestore = async () => {
        if(database === null || backupId === null) return;

        const restored = await restore.run(database.id, backupId).then(() => true, () => false);
        if(!restored) return;

        setBackupId(null);
        onClose();
        onRestored();
    };

    return (
        <Modal
            isOpen={database !== null}
            onOpenChange={(isOpen) => { if(!isOpen) handleClose(); }}
            title={database === null ? 'Restore database' : `Restore ${database.name}`}
        >
            <div className='flex flex-col gap-4'>
                {backups.length === 0 ? (
                    <p className='text-muted'>This database has no backups yet.</p>
                ) : (
                    <div className='flex flex-col gap-1.5'>
                        <Label>Backup</Label>
                        <Select
                            aria-label='Backup'
                            selectedKey={backupId}
                            isDisabled={restore.loading}
                            onSelectionChange={(key) => setBackupId(String(key))}
                        >
                            <Select.Trigger>
                                <Select.Value>Select a backup</Select.Value>
                                <Select.Indicator />
                            </Select.Trigger>

                            <Select.Popover>
                                <ListBox>
                                    {backups.map((backup) => (
                                        <ListBoxItem key={backup.id} id={backup.id} textValue={formatDate(backup.createdAt)}>
                                            {formatDate(backup.createdAt)}
                                        </ListBoxItem>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                        </Select>
                    </div>
                )}

                {restore.error !== undefined && <InlineError>{copy(restore.error)}</InlineError>}

                <div className='flex justify-end gap-2'>
                    <Button variant='secondary' isDisabled={restore.loading} onPress={handleClose}>Cancel</Button>
                    <Button
                        isPending={restore.loading}
                        isDisabled={backupId === null}
                        onPress={() => { void handleRestore(); }}
                    >
                        Restore
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

interface DeleteDatabaseDialogProps{
    database: Database | null;
    onClose: () => void;
    onRemoved: () => void;
}

const DeleteDatabaseDialog = ({ database, onClose, onRemoved }: DeleteDatabaseDialogProps) => (
    <DeleteConfirmDialog
        isOpen={database !== null}
        title='Delete database'
        description={database === null
            ? ''
            : `This permanently removes "${database.name}" and its backups. This action cannot be undone.`}
        entityId={database?.id ?? null}
        remove={(id) => databaseApi.remove({ path: { id } })}
        getErrorMessage={copy}
        onClose={onClose}
        onRemoved={onRemoved}
    />
);

interface UninstallDialogProps{
    install: TemplateInstall | null;
    onClose: () => void;
    onRemoved: () => void;
}

const UninstallDialog = ({ install, onClose, onRemoved }: UninstallDialogProps) => (
    <DeleteConfirmDialog
        isOpen={install !== null}
        title='Uninstall template'
        description={install === null
            ? ''
            : `This permanently removes "${install.name}" and its services. This action cannot be undone.`}
        confirmLabel='Uninstall'
        entityId={install?.id ?? null}
        remove={(id) => templateInstallApi.remove({ path: { id } })}
        getErrorMessage={copy}
        onClose={onClose}
        onRemoved={onRemoved}
    />
);

const countKinds = (rows: Row[]): Record<KindFilter, number> => {
    const counts: Record<KindFilter, number> = { all: rows.length, repository: 0, stack: 0, database: 0, template: 0 };
    for(const row of rows) counts[kindOf(row)] += 1;
    return counts;
};

const LoadError = ({ title, error, onRetry }: { title: string; error: Error; onRetry: () => void }) => (
    <>
        <PageBar title='Applications' icon={AppWindow} />
        <CenterState>
            <ErrorState title={title} description={copy(error)} onRetry={onRetry} />
        </CenterState>
    </>
);

const Applications = () => {
    const navigate = useNavigate();
    const organizationId = useCurrentOrganizationId();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });
    const [params, setParams] = useSearchParams();
    const [kind, setKind] = useState<KindFilter>('all');
    const [search, setSearch] = useState('');

    const projectList = projects.data ?? [];
    const requested = Number(params.get('project'));
    const projectId = (projectList.find((project) => project.id === requested)
        ?? projectList.find((project) => project.isDefault)
        ?? projectList[0])?.id ?? null;

    const selectProject = (id: number) => {
        setParams((current) => {
            const next = new URLSearchParams(current);
            next.set('project', String(id));
            return next;
        }, { replace: true });
    };

    const repositoriesQuery = useResource(repositoryRoutes, { list: 'mine' });
    const databasesQuery = useQuery((databasesProjectId: number) => databaseApi.listByProject({ path: { projectId: databasesProjectId } }), [projectId ?? undefined], { enabled: projectId !== null });
    const databases = usePolledQuery(databasesQuery, {
        while: (data) => data.some((database) => isDatabaseTransient(database.status)),
        everyMs: 5000
    });
    const installsQuery = useResource(templateInstallRoutes, {
        list: 'listByProject',
        request: projectId === null ? null : { path: { projectId } }
    });

    const [createDatabaseOpen, setCreateDatabaseOpen] = useState(false);
    const [deleteAppTarget, setDeleteAppTarget] = useState<Repository | null>(null);
    const [connectionTarget, setConnectionTarget] = useState<Database | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<Database | null>(null);
    const [deleteDatabaseTarget, setDeleteDatabaseTarget] = useState<Database | null>(null);
    const [uninstallTarget, setUninstallTarget] = useState<TemplateInstall | null>(null);

    const backup = useMutation((id: number) => databaseApi.backup({ path: { id } }));

    const installs = installsQuery.data;
    const installsSettling = installs !== null && installs.some((install) => isInstallTransient(install.status));
    const refreshInstalls = installsQuery.refresh;
    useEffect(() => {
        if(!installsSettling) return;
        const timer = setInterval(refreshInstalls, 4000);
        return () => clearInterval(timer);
    }, [installsSettling, refreshInstalls]);

    const operateInstall = (install: TemplateInstall, operation: TemplateInstallOperation) => {
        void installsQuery.operate({ path: { id: install.id }, body: { operation } }).catch(() => undefined);
    };

    const redeployInstall = (install: TemplateInstall) => {
        void installsQuery.redeploy({ path: { id: install.id } }).catch(() => undefined);
    };

    const handleBackup = async (database: Database) => {
        await backup.run(database.id).then(() => databases.reload(), () => undefined);
    };

    if(organizationId === null || projects.loading || repositoriesQuery.loading){
        return <PageSkeleton actions={1} columns={5} />;
    }

    if(projects.error !== undefined) return <LoadError title='Could not load projects' error={projects.error} onRetry={projects.refresh} />;

    if(repositoriesQuery.error !== undefined){
        return <LoadError title='Could not load applications' error={repositoriesQuery.error} onRetry={repositoriesQuery.refresh} />;
    }

    const rows = buildRows(
        repositoriesQuery.data ?? [],
        projectId === null ? [] : databases.data ?? [],
        projectId === null ? [] : installsQuery.data ?? []
    );

    const query = search.trim().toLowerCase();
    const filtered = rows.filter((row) => (kind === 'all' || kindOf(row) === kind) && (query === '' || row.name.toLowerCase().includes(query)));
    const narrowed = query !== '' || kind !== 'all';

    const scopedLoading = projectId !== null && (databases.loading || installsQuery.loading);
    const scopedError = databases.error ?? installsQuery.error ?? backup.error;

    return (
        <>
            <ApplicationsHeader
                kind={kind}
                counts={countKinds(rows)}
                canAddDatabase={projectId !== null}
                onKindChange={setKind}
                onAddApplication={() => navigate('/repositories/create')}
                onAddCompose={() => navigate('/compose/create')}
                onAddDatabase={() => setCreateDatabaseOpen(true)}
                onInstallTemplate={() => navigate('/templates')}
            />

            <ApplicationsFilters
                projects={projectList}
                projectId={projectId}
                search={search}
                shown={filtered.length}
                total={rows.length}
                onProjectChange={selectProject}
                onSearchChange={setSearch}
            />

            {scopedError !== undefined && <InlineError className='border-b border-separator px-4 py-2'>{copy(scopedError)}</InlineError>}

            <PageBody variant='flush' fill>
                <ListPageShell
                    loading={scopedLoading}
                    skeleton={<TableSkeleton columns={5} />}
                    errorTitle='Could not load applications'
                    getErrorDescription={copy}
                    onRetry={databases.reload}
                    isEmpty={filtered.length === 0}
                    empty={{
                        icon: AppWindow,
                        title: narrowed ? 'No matches' : 'No applications yet',
                        description: narrowed
                            ? 'Try another search or show all applications.'
                            : 'Import a repository, deploy a compose stack, or install a template from the catalogue.',
                        action: narrowed ? undefined : (
                            <Button onPress={() => navigate('/repositories/create')}>
                                <Plus aria-hidden='true' />
                                New application
                            </Button>
                        )
                    }}
                >
                    <ApplicationsList
                        rows={filtered}
                        onNavigate={navigate}
                        onDeleteApp={setDeleteAppTarget}
                        onConnectionString={setConnectionTarget}
                        onBackup={(database) => { void handleBackup(database); }}
                        onRestore={setRestoreTarget}
                        onDeleteDatabase={setDeleteDatabaseTarget}
                        onUninstall={setUninstallTarget}
                        onOperateInstall={operateInstall}
                        onRedeployInstall={redeployInstall}
                    />
                </ListPageShell>
            </PageBody>

            <CreateDatabaseDialog
                projectId={projectId}
                isOpen={createDatabaseOpen}
                onClose={setCreateDatabaseOpen}
                onCreated={() => { setCreateDatabaseOpen(false); databases.reload(); }}
            />

            <DeleteApplicationDialog
                repository={deleteAppTarget}
                onClose={() => setDeleteAppTarget(null)}
                onRemoved={repositoriesQuery.refresh}
            />

            <ConnectionStringDialog
                key={connectionTarget?.id ?? 'connection'}
                database={connectionTarget}
                onClose={() => setConnectionTarget(null)}
            />

            <RestoreDatabaseDialog
                database={restoreTarget}
                onClose={() => setRestoreTarget(null)}
                onRestored={databases.reload}
            />

            <DeleteDatabaseDialog
                database={deleteDatabaseTarget}
                onClose={() => setDeleteDatabaseTarget(null)}
                onRemoved={databases.reload}
            />

            <UninstallDialog
                install={uninstallTarget}
                onClose={() => setUninstallTarget(null)}
                onRemoved={installsQuery.refresh}
            />
        </>
    );
};

export default Applications;
