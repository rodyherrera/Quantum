import { Dropdown } from '@heroui/react';
import { MoreHorizontal } from 'lucide-react';
import ListGroup from '@/shared/components/list/ListGroup';
import ListRow from '@/shared/components/list/ListRow';
import InternalAddress from '@/shared/components/InternalAddress';
import StatusText from '@/shared/components/StatusText';
import { STATUS_TONE } from '@/shared/utils/status-tone';
import { isInstallRunning, isInstallTransient } from '@/modules/template/utils/install-status';
import { addressOf, groupRows, linkOf, STATE_STATUS, statusOf } from '@/modules/application/utils/application-rows';
import { formatDate, formatDay } from '@/shared/utils/format-date';
import type { Row } from '@/modules/application/utils/application-rows';
import type { TemplateInstallOperation } from '@quantum/contracts/modules/template/http';
import type { Database as DatabaseEntity } from '@quantum/contracts/modules/database/domain';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

export interface RowActionHandlers{
    onNavigate: (path: string) => void;
    onDeleteApp: (repository: Repository) => void;
    onConnectionString: (database: DatabaseEntity) => void;
    onBackup: (database: DatabaseEntity) => void;
    onRestore: (database: DatabaseEntity) => void;
    onDeleteDatabase: (database: DatabaseEntity) => void;
    onUninstall: (install: TemplateInstall) => void;
    onOperateInstall: (install: TemplateInstall, operation: TemplateInstallOperation) => void;
    onRedeployInstall: (install: TemplateInstall) => void;
}

const rowActions = (row: Row, handlers: RowActionHandlers) => {
    if(row.kind === 'app'){
        const id = row.repository.id;
        return [
            <Dropdown.Item key='deployments' onAction={() => handlers.onNavigate(`/repositories/${id}/deployments`)}>Deployments</Dropdown.Item>,
            <Dropdown.Item key='logs' onAction={() => handlers.onNavigate(`/repositories/${id}/logs`)}>Logs</Dropdown.Item>,
            <Dropdown.Item key='shell' onAction={() => handlers.onNavigate(`/repositories/${id}/shell`)}>Shell</Dropdown.Item>,
            <Dropdown.Item key='env' onAction={() => handlers.onNavigate(`/repositories/${id}/environment-variables`)}>Environment variables</Dropdown.Item>,
            <Dropdown.Item key='settings' onAction={() => handlers.onNavigate(`/repositories/${id}/settings`)}>Settings</Dropdown.Item>,
            <Dropdown.Item key='delete' variant='danger' onAction={() => handlers.onDeleteApp(row.repository)}>Delete</Dropdown.Item>
        ];
    }

    if(row.kind === 'database'){
        return [
            <Dropdown.Item key='connection' onAction={() => handlers.onConnectionString(row.database)}>Connection string</Dropdown.Item>,
            <Dropdown.Item key='backup' onAction={() => handlers.onBackup(row.database)}>Backup now</Dropdown.Item>,
            <Dropdown.Item key='restore' isDisabled={row.database.backups.length === 0} onAction={() => handlers.onRestore(row.database)}>Restore</Dropdown.Item>,
            <Dropdown.Item key='delete' variant='danger' onAction={() => handlers.onDeleteDatabase(row.database)}>Delete</Dropdown.Item>
        ];
    }

    const install = row.install;
    const running = isInstallRunning(install.status);
    const busy = isInstallTransient(install.status);
    return [
        <Dropdown.Item key='services' onAction={() => handlers.onNavigate(`/installs/${install.id}/services`)}>Services</Dropdown.Item>,
        <Dropdown.Item key='logs' onAction={() => handlers.onNavigate(`/installs/${install.id}/logs`)}>Logs</Dropdown.Item>,
        <Dropdown.Item key='shell' onAction={() => handlers.onNavigate(`/installs/${install.id}/shell`)}>Shell</Dropdown.Item>,
        <Dropdown.Item key='env' onAction={() => handlers.onNavigate(`/installs/${install.id}/environment`)}>Environment variables</Dropdown.Item>,
        ...(install.compose === null ? [] : [
            <Dropdown.Item key='compose' onAction={() => handlers.onNavigate(`/installs/${install.id}/compose`)}>Compose</Dropdown.Item>
        ]),
        <Dropdown.Item key='start' isDisabled={running || busy} onAction={() => handlers.onOperateInstall(install, 'start')}>Start</Dropdown.Item>,
        <Dropdown.Item key='stop' isDisabled={!running || busy} onAction={() => handlers.onOperateInstall(install, 'stop')}>Stop</Dropdown.Item>,
        <Dropdown.Item key='restart' isDisabled={busy} onAction={() => handlers.onOperateInstall(install, 'restart')}>Restart</Dropdown.Item>,
        <Dropdown.Item key='redeploy' isDisabled={busy} onAction={() => handlers.onRedeployInstall(install)}>Redeploy</Dropdown.Item>,
        <Dropdown.Item key='uninstall' variant='danger' onAction={() => handlers.onUninstall(install)}>Uninstall</Dropdown.Item>
    ];
};

const COLUMNS = 'grid-cols-[minmax(0,1fr)_1.75rem] md:grid-cols-[minmax(0,1fr)_auto_9.5rem_3.5rem_1.75rem]';

interface ApplicationRowProps{
    row: Row;
    handlers: RowActionHandlers;
}

const ApplicationRow = ({ row, handlers }: ApplicationRowProps) => {
    const status = statusOf(row);
    const flagged = status.isTransient || status.color === 'danger';

    return (
        <ListRow className={`${COLUMNS} pl-7.5`} to={linkOf(row)} label={`Open ${row.name}`}>
            <span className='min-w-0 truncate'>
                <span className='font-medium text-foreground'>{row.name}</span>
                <span className='ml-2 text-subtle'>{row.subtitle}</span>
            </span>

            <span className='hidden md:block'>
                {flagged && <StatusText color={status.color} label={status.label} className='text-xs font-medium' />}
            </span>

            <span className='hidden min-w-0 md:block'><InternalAddress address={addressOf(row)} /></span>

            <time dateTime={row.date} title={formatDate(row.date)} className='hidden text-right text-xs tabular-nums text-subtle md:block'>
                {formatDay(row.date)}
            </time>

            <Dropdown>
                <Dropdown.Trigger
                    aria-label={`Actions for ${row.name}`}
                    className='flex size-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-default hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none'
                >
                    <MoreHorizontal aria-hidden='true' className='size-4' />
                </Dropdown.Trigger>

                <Dropdown.Popover placement='bottom end'>
                    <Dropdown.Menu aria-label={`Actions for ${row.name}`}>{rowActions(row, handlers)}</Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        </ListRow>
    );
};

interface ApplicationsListProps extends RowActionHandlers{
    rows: Row[];
}

/* Applications grouped by state, what needs attention on top. */
const ApplicationsList = ({ rows, ...handlers }: ApplicationsListProps) => (
    <div>
        {groupRows(rows).map((group) => {
            const status = STATE_STATUS[group.state];

            return (
                <ListGroup key={group.state} label={status.label} count={group.rows.length} tone={STATUS_TONE[status.color]}>
                    {group.rows.map((row) => <ApplicationRow key={row.key} row={row} handlers={handlers} />)}
                </ListGroup>
            );
        })}
    </div>
);

export default ApplicationsList;
