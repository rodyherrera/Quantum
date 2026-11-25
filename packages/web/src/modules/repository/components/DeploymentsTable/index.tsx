import { Chip, Dropdown } from '@heroui/react';
import { MoreHorizontal } from 'lucide-react';
import ListRow from '@/shared/components/list/ListRow';
import StatusText from '@/shared/components/StatusText';
import { deploymentStatusColor, deploymentStatusLabel } from '@/modules/repository/utils/deployment-status';
import { formatDate } from '@/shared/utils/format-date';
import { DeploymentStatus } from '@quantum/contracts/modules/deployment/domain';
import type { Deployment, DeploymentArtifact } from '@quantum/contracts/modules/deployment/domain';

const COLUMNS = 'grid-cols-[minmax(0,1fr)_1.75rem] md:grid-cols-[2.75rem_minmax(0,1fr)_auto_auto_1.75rem]';

const shortDigest = (digest: string): string => digest.replace(/^sha256:/, '').slice(0, 7);

interface RevisionChipProps{
    artifact: DeploymentArtifact | null;
}

/* Exec builds record the commit they checked out; image builds record the image id. */
const RevisionChip = ({ artifact }: RevisionChipProps) => {
    if(artifact === null || artifact.digest === '') return null;

    const isCommit = artifact.builder === 'exec';

    return (
        <Chip size='sm' className='rounded-[0.3125rem] font-mono' title={`${isCommit ? 'Commit' : 'Image'} ${artifact.digest}`}>
            {shortDigest(artifact.digest)}
        </Chip>
    );
};

interface DeploymentRowProps{
    deployment: Deployment;
    onRollback: (deployment: Deployment) => void;
    onDelete: (deployment: Deployment) => void;
}

const DeploymentActions = ({ deployment, onRollback, onDelete }: DeploymentRowProps) => {
    const label = `Actions for deployment #${deployment.id}`;
    const items = [
        ...(deployment.url === null ? [] : [
            <Dropdown.Item key='open' href={deployment.url} target='_blank' rel='noreferrer'>Open URL</Dropdown.Item>
        ]),
        <Dropdown.Item key='rollback' isDisabled={deployment.artifact === null} onAction={() => onRollback(deployment)}>Roll back</Dropdown.Item>,
        <Dropdown.Item key='delete' variant='danger' onAction={() => onDelete(deployment)}>Delete</Dropdown.Item>
    ];

    return (
        <Dropdown>
            <Dropdown.Trigger
                aria-label={label}
                className='flex size-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-default hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none'
            >
                <MoreHorizontal aria-hidden='true' className='size-4' />
            </Dropdown.Trigger>

            <Dropdown.Popover placement='bottom end'>
                <Dropdown.Menu aria-label={label}>{items}</Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

const DeploymentRow = ({ deployment, onRollback, onDelete }: DeploymentRowProps) => {
    const color = deploymentStatusColor(deployment.status);
    const label = deploymentStatusLabel(deployment.status);

    return (
        <ListRow className={`${COLUMNS} last:border-b-0`}>
            <span className='hidden font-mono text-xs text-subtle md:block'>#{deployment.id}</span>

            <div className='min-w-0 py-2'>
                <div className='flex min-w-0 items-center gap-2'>
                    {deployment.commit === null
                        ? <span className='truncate text-muted'>No commit recorded</span>
                        : <span className='truncate font-medium text-foreground'>{deployment.commit.message}</span>}
                    {deployment.status !== DeploymentStatus.Success && <StatusText color={color} label={label} className='shrink-0 text-xs font-medium' />}
                </div>

                {deployment.error !== null && <p className='mt-0.5 break-words text-xs text-danger'>{deployment.error}</p>}
            </div>

            <span className='hidden md:block'>
                <RevisionChip artifact={deployment.artifact} />
            </span>

            <time dateTime={deployment.createdAt} className='hidden whitespace-nowrap text-right text-xs tabular-nums text-subtle md:block'>
                {formatDate(deployment.createdAt)}
            </time>

            <DeploymentActions deployment={deployment} onRollback={onRollback} onDelete={onDelete} />
        </ListRow>
    );
};

interface DeploymentsTableProps{
    deployments: Deployment[];
    onRollback: (deployment: Deployment) => void;
    onDelete: (deployment: Deployment) => void;
}

const DeploymentsTable = ({ deployments, onRollback, onDelete }: DeploymentsTableProps) => (
    <section aria-label='Deployments' className='min-w-0 overflow-hidden rounded-lg border border-separator bg-surface'>
        {deployments.map((deployment) => (
            <DeploymentRow key={deployment.id} deployment={deployment} onRollback={onRollback} onDelete={onDelete} />
        ))}
    </section>
);

export default DeploymentsTable;
