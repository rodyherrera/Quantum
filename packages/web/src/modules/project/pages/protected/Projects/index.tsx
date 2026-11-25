import { useState } from 'react';
import { PageSkeleton } from '@/shared/components/skeletons';
import { Button, Chip, Dropdown } from '@heroui/react';
import { MoreHorizontal } from 'lucide-react';
import PageBar from '@/shared/components/layout/PageBar';
import PageBody from '@/shared/components/layout/PageBody';
import ListRow from '@/shared/components/list/ListRow';
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
import { formatDate, formatDay } from '@/shared/utils/format-date';
import type { Project } from '@quantum/contracts/modules/project/domain';

const copy = errorCopy(projectErrorMessages);

const COLUMNS = 'grid-cols-[minmax(0,1fr)_1.75rem] sm:grid-cols-[minmax(0,1fr)_12rem_4.5rem_1.75rem]';

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

interface ProjectRowProps{
    project: Project;
    onRename: (project: Project) => void;
    onDelete: (project: Project) => void;
}

const ProjectRow = ({ project, onRename, onDelete }: ProjectRowProps) => (
    <ListRow className={COLUMNS} to={`/applications?project=${project.id}`} label={`Open ${project.name}`}>
        <span className='flex min-w-0 items-center gap-2.5'>
            <span className='truncate font-medium text-foreground'>{project.name}</span>
            {project.isDefault && <Chip size='sm'>Default</Chip>}
        </span>

        <span className='hidden truncate font-mono text-xs text-subtle sm:block'>{project.slug}</span>

        <time dateTime={project.createdAt} title={formatDate(project.createdAt)} className='hidden text-right text-xs tabular-nums text-subtle sm:block'>
            {formatDay(project.createdAt)}
        </time>

        <Dropdown>
            <Dropdown.Trigger
                aria-label={`Actions for ${project.name}`}
                className='flex size-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-default hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none'
            >
                <MoreHorizontal aria-hidden='true' className='size-4' />
            </Dropdown.Trigger>

            <Dropdown.Popover placement='bottom end'>
                <Dropdown.Menu aria-label={`Actions for ${project.name}`}>
                    <Dropdown.Item onAction={() => onRename(project)}>Rename</Dropdown.Item>
                    <Dropdown.Item variant='danger' onAction={() => onDelete(project)}>Delete</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    </ListRow>
);

interface ProjectsListProps{
    projects: Project[];
    onRename: (project: Project) => void;
    onDelete: (project: Project) => void;
}

const ProjectsList = ({ projects, onRename, onDelete }: ProjectsListProps) => (
    <div>
        <div aria-hidden='true' className={`sticky top-[var(--bar-height)] z-10 hidden h-8 items-center gap-3 border-b border-separator bg-background px-4 text-xs font-medium text-subtle sm:grid ${COLUMNS}`}>
            <span>Project</span>
            <span>Slug</span>
            <span className='text-right'>Created</span>
        </div>

        {projects.map((project) => <ProjectRow key={project.id} project={project} onRename={onRename} onDelete={onDelete} />)}
    </div>
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

    if(organizationId === null || projects.loading){
        return <PageSkeleton actions={1} columns={3} />;
    }

    const items = projects.data ?? [];
    const newProject = (
        <Button size='sm' onPress={() => setCreateOpen(true)}>
            New project
        </Button>
    );

    return (
        <>
            <PageBar title='Projects' actions={projects.error === undefined ? newProject : undefined} />

            <PageBody variant='flush' fill>
                <ListPageShell
                    error={projects.error}
                    errorTitle='Could not load projects'
                    getErrorDescription={copy}
                    onRetry={projects.refresh}
                    isEmpty={items.length === 0}
                    empty={{
                        title: 'No projects yet',
                        description: 'Projects group related deployments. Create your first one to get started.',
                        action: newProject
                    }}
                >
                    <ProjectsList projects={items} onRename={setRenameTarget} onDelete={setDeleteTarget} />
                </ListPageShell>
            </PageBody>

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
        </>
    );
};

export default Projects;
