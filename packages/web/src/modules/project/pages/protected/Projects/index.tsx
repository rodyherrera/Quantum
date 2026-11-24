import { useState } from 'react';
import { PageSkeleton } from '@/shared/components/skeletons';
import { Button, Chip, Dropdown, Table } from '@heroui/react';
import { ArrowRight, FolderKanban, MoreVertical } from 'lucide-react';
import PageBody from '@/shared/components/layout/PageBody';
import PageHeader from '@/shared/components/layout/PageHeader';
import ListPageShell from '@/shared/components/ListPageShell';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import CreateProjectDialog from '@/modules/project/components/CreateProjectDialog';
import RenameProjectDialog from '@/modules/project/components/RenameProjectDialog';
import { useResource } from '@/shared/hooks/api/use-resource';
import { projectApi } from '@/modules/project/api/api';
import { projectRoutes } from '@quantum/contracts/modules/project/routes';
import { useCurrentOrganizationId } from '@/modules/organization/hooks/use-current-organization-id';
import { projectErrorMessages } from '@/modules/project/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { formatDate } from '@/shared/utils/format-date';
import type { Project } from '@quantum/contracts/modules/project/domain';

const copy = errorCopy(projectErrorMessages);

interface ProjectsHeaderProps{
    onCreate: () => void;
}

const ProjectsHeader = ({ onCreate }: ProjectsHeaderProps) => (
    <PageHeader
        title='Projects'
        description='Group related deployments by organization.'
        actions={(
            <Button onPress={onCreate}>
                New project
                <ArrowRight aria-hidden='true' className='size-4' />
            </Button>
        )}
    />
);

interface DeleteProjectDialogProps{
    project: Project | null;
    onClose: () => void;
    onDeleted: () => void;
    onOptimisticDelete: () => () => void;
}

const DeleteProjectDialog = ({ project, onClose, onDeleted, onOptimisticDelete }: DeleteProjectDialogProps) => (
    <DeleteConfirmDialog
        isOpen={project !== null}
        title='Delete project'
        description={project === null
            ? ''
            : `This permanently removes "${project.name}" and its resources. This action cannot be undone.`}
        entityId={project?.id ?? null}
        remove={(projectId) => projectApi.remove({ path: { id: projectId } })}
        getErrorMessage={copy}
        optimistic={onOptimisticDelete}
        onClose={onClose}
        onRemoved={onDeleted}
    />
);

interface ProjectsTableProps{
    projects: Project[];
    onRename: (project: Project) => void;
    onDelete: (project: Project) => void;
}

const ProjectsTable = ({ projects, onRename, onDelete }: ProjectsTableProps) => (
    <Table>
        <Table.ScrollContainer>
            <Table.Content aria-label='Projects'>
                <Table.Header>
                    <Table.Column isRowHeader>Project</Table.Column>
                    <Table.Column>Slug</Table.Column>
                    <Table.Column>Created</Table.Column>
                    <Table.Column><span className='sr-only'>Actions</span></Table.Column>
                </Table.Header>

                <Table.Body>
                    {projects.map((project) => (
                        <Table.Row key={project.id}>
                            <Table.Cell>
                                <div className='flex items-center gap-2'>
                                    <span className='font-medium text-foreground'>{project.name}</span>
                                    {project.isDefault && <Chip size='sm' variant='soft'>Default</Chip>}
                                </div>
                            </Table.Cell>

                            <Table.Cell>
                                <span className='font-mono text-[0.8125rem] text-muted'>{project.slug}</span>
                            </Table.Cell>

                            <Table.Cell>{formatDate(project.createdAt)}</Table.Cell>

                            <Table.Cell>
                                <div className='flex justify-end'>
                                    <Dropdown>
                                        <Dropdown.Trigger
                                            aria-label={`Actions for ${project.name}`}
                                            className='p-1.5 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
                                        >
                                            <MoreVertical aria-hidden='true' className='size-4' />
                                        </Dropdown.Trigger>

                                        <Dropdown.Popover placement='bottom end'>
                                            <Dropdown.Menu aria-label={`Actions for ${project.name}`}>
<Dropdown.Item onAction={() => onRename(project)}>Rename</Dropdown.Item>
                                                 <Dropdown.Item variant='danger' onAction={() => onDelete(project)}>
                                                    Delete
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
    </Table>
);

const Projects = () => {
    const organizationId = useCurrentOrganizationId();
    const projects = useResource(projectRoutes, {
        list: 'listByOrganization',
        request: organizationId === null ? null : { path: { orgId: organizationId } }
    });
    const [createOpen, setCreateOpen] = useState(false);
    const [renameTarget, setRenameTarget] = useState<Project | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

    if(organizationId === null || projects.loading || projects.error !== undefined){
        return (
            <ListPageShell
                fill
                loading={organizationId === null || projects.loading}
                skeleton={<PageSkeleton actions={1} columns={4} />}
                error={organizationId === null ? undefined : projects.error}
                errorTitle='Could not load projects'
                getErrorDescription={copy}
                onRetry={projects.refresh}
            />
        );
    }

    const items = projects.data ?? [];

    return (
        <PageBody fill>
            <ProjectsHeader onCreate={() => setCreateOpen(true)} />

            <div className='mt-6 flex flex-1 flex-col'>
                <ListPageShell
                    errorTitle='Could not load projects'
                    getErrorDescription={copy}
                    onRetry={projects.refresh}
                    isEmpty={items.length === 0}
                    empty={{
                        icon: FolderKanban,
                        title: 'No projects yet',
                        description: 'Projects group related deployments. Create your first one to get started.',
                        action: (
                            <Button onPress={() => setCreateOpen(true)}>
                                New project
                                <ArrowRight aria-hidden='true' className='size-4' />
                            </Button>
                        )
                    }}
                >
                    <ProjectsTable
                        projects={items}
                        onRename={setRenameTarget}
                        onDelete={setDeleteTarget}
                    />
                </ListPageShell>
            </div>

            <CreateProjectDialog
                organizationId={organizationId}
                isOpen={createOpen}
                onClose={setCreateOpen}
                onCreated={projects.refresh}
            />

            <RenameProjectDialog
                key={renameTarget?.id ?? 'rename'}
                project={renameTarget}
                onClose={() => setRenameTarget(null)}
                onRenamed={projects.refresh}
            />

            <DeleteProjectDialog
                project={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={projects.refresh}
                onOptimisticDelete={() => projects.patch(
                    (items) => items.filter((item) => item.id !== deleteTarget?.id)
                )}
            />
        </PageBody>
    );
};

export default Projects;
