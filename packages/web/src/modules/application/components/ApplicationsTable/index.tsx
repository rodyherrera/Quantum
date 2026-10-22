import { Dropdown, Table } from '@heroui/react';
import { MoreVertical } from 'lucide-react';
import StatusDot from '@/shared/components/StatusDot';
import InternalAddress from '@/shared/components/InternalAddress';
import { installStatusColor, installStatusLabel, isInstallRunning, isInstallTransient } from '@/modules/template/utils/install-status';
import { databaseStatusColor, databaseStatusLabel, isDatabaseTransient } from '@/modules/application/utils/status';
import { containerStatusColor, containerStatusLabel, isContainerTransient } from '@/modules/application/utils/container-status';
import { formatDate } from '@/shared/utils/format-date';
import type { Row } from '@/modules/application/utils/application-rows';
import type { TemplateInstallOperation } from '@quantum/contracts/modules/template/http';
import type { Database } from '@quantum/contracts/modules/database/domain';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall, TemplateInstallService } from '@quantum/contracts/modules/template/domain';

const primaryService = (install: TemplateInstall): TemplateInstallService | undefined =>
    install.services.find((service) => service.kind === 'app' && service.ports.length > 0)
        ?? install.services.find((service) => service.kind === 'app')
        ?? install.services[0];

export interface RowActionHandlers{
    onNavigate: (path: string) => void;
    onDeleteApp: (repository: Repository) => void;
    onConnectionString: (database: Database) => void;
    onBackup: (database: Database) => void;
    onRestore: (database: Database) => void;
    onDeleteDatabase: (database: Database) => void;
    onUninstall: (install: TemplateInstall) => void;
    onOperateInstall: (install: TemplateInstall, operation: TemplateInstallOperation) => void;
    onRedeployInstall: (install: TemplateInstall) => void;
}

const rowActions = (row: Row, handlers: RowActionHandlers) => {
    if(row.kind === 'app'){
        const id = row.repository.id;
        return [
            <Dropdown.Item key='deployments' onAction={() => handlers.onNavigate(`/repositories/${id}/deployments`)}>
                Deployments
            </Dropdown.Item>,
            <Dropdown.Item key='logs' onAction={() => handlers.onNavigate(`/repositories/${id}/logs`)}>
                Logs
            </Dropdown.Item>,
            <Dropdown.Item key='shell' onAction={() => handlers.onNavigate(`/repositories/${id}/shell`)}>
                Shell
            </Dropdown.Item>,
            <Dropdown.Item key='env' onAction={() => handlers.onNavigate(`/repositories/${id}/environment-variables`)}>
                Environment variables
            </Dropdown.Item>,
            <Dropdown.Item key='settings' onAction={() => handlers.onNavigate(`/repositories/${id}/settings`)}>
                Settings
            </Dropdown.Item>,
            <Dropdown.Item key='delete' variant='danger' onAction={() => handlers.onDeleteApp(row.repository)}>
                Delete
            </Dropdown.Item>
        ];
    }

    if(row.kind === 'database'){
        return [
            <Dropdown.Item key='connection' onAction={() => handlers.onConnectionString(row.database)}>
                Connection string
            </Dropdown.Item>,
            <Dropdown.Item key='backup' onAction={() => handlers.onBackup(row.database)}>
                Backup now
            </Dropdown.Item>,
            <Dropdown.Item key='restore' isDisabled={row.database.backups.length === 0} onAction={() => handlers.onRestore(row.database)}>
                Restore
            </Dropdown.Item>,
            <Dropdown.Item key='delete' variant='danger' onAction={() => handlers.onDeleteDatabase(row.database)}>
                Delete
            </Dropdown.Item>
        ];
    }

    const install = row.install;
    const running = isInstallRunning(install.status);
    const busy = isInstallTransient(install.status);
    return [
        <Dropdown.Item key='services' onAction={() => handlers.onNavigate(`/installs/${install.id}/services`)}>
            Services
        </Dropdown.Item>,
        <Dropdown.Item key='logs' onAction={() => handlers.onNavigate(`/installs/${install.id}/logs`)}>
            Logs
        </Dropdown.Item>,
        <Dropdown.Item key='shell' onAction={() => handlers.onNavigate(`/installs/${install.id}/shell`)}>
            Shell
        </Dropdown.Item>,
        <Dropdown.Item key='env' onAction={() => handlers.onNavigate(`/installs/${install.id}/environment`)}>
            Environment variables
        </Dropdown.Item>,
        ...(install.compose === null ? [] : [
            <Dropdown.Item key='compose' onAction={() => handlers.onNavigate(`/installs/${install.id}/compose`)}>
                Compose
            </Dropdown.Item>
        ]),
        <Dropdown.Item key='start' isDisabled={running || busy} onAction={() => handlers.onOperateInstall(install, 'start')}>
            Start
        </Dropdown.Item>,
        <Dropdown.Item key='stop' isDisabled={!running || busy} onAction={() => handlers.onOperateInstall(install, 'stop')}>
            Stop
        </Dropdown.Item>,
        <Dropdown.Item key='restart' isDisabled={busy} onAction={() => handlers.onOperateInstall(install, 'restart')}>
            Restart
        </Dropdown.Item>,
        <Dropdown.Item key='redeploy' isDisabled={busy} onAction={() => handlers.onRedeployInstall(install)}>
            Redeploy
        </Dropdown.Item>,
        <Dropdown.Item key='uninstall' variant='danger' onAction={() => handlers.onUninstall(install)}>
            Uninstall
        </Dropdown.Item>
    ];
};

interface ApplicationsTableProps extends RowActionHandlers{
    rows: Row[];
}

const ApplicationsTable = ({ rows, ...handlers }: ApplicationsTableProps) => (
    <Table>
        <Table.ScrollContainer>
            <Table.Content aria-label='Applications'>
                <Table.Header>
                    <Table.Column isRowHeader>Name</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column>Address</Table.Column>
                    <Table.Column>Created</Table.Column>
                    <Table.Column><span className='sr-only'>Actions</span></Table.Column>
                </Table.Header>

                <Table.Body>
                    {rows.map((row) => {
                        return (
                            <Table.Row key={row.key}>
                                <Table.Cell>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-foreground'>{row.name}</span>
                                        <span className='text-[0.8125rem] text-muted'>{row.subtitle}</span>
                                    </div>
                                </Table.Cell>

                                <Table.Cell>
                                    {row.kind === 'app' && (
                                        <StatusDot
                                            color={containerStatusColor(row.repository.containerStatus)}
                                            label={containerStatusLabel(row.repository.containerStatus)}
                                            isTransient={isContainerTransient(row.repository.containerStatus)}
                                        />
                                    )}
                                    {row.kind === 'database' && (
                                        <StatusDot
                                            color={databaseStatusColor(row.database.status)}
                                            label={databaseStatusLabel(row.database.status)}
                                            isTransient={isDatabaseTransient(row.database.status)}
                                        />
                                    )}
                                    {row.kind === 'install' && (
                                        <StatusDot
                                            color={installStatusColor(row.install.status)}
                                            label={installStatusLabel(row.install.status)}
                                            isTransient={isInstallTransient(row.install.status)}
                                        />
                                    )}
                                </Table.Cell>

                                <Table.Cell>
                                    {row.kind === 'app' && <InternalAddress address={row.repository.address} />}
                                    {row.kind === 'install' && <InternalAddress address={primaryService(row.install)?.address ?? null} />}
                                    {row.kind === 'database' && <InternalAddress address={row.database.address} />}
                                </Table.Cell>

                                <Table.Cell>{formatDate(row.date)}</Table.Cell>

                                <Table.Cell>
                                    <div className='flex justify-end'>
                                        <Dropdown>
                                            <Dropdown.Trigger
                                                aria-label={`Actions for ${row.name}`}
                                                className='p-1.5 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'
                                            >
                                                <MoreVertical aria-hidden='true' className='size-4' />
                                            </Dropdown.Trigger>

                                            <Dropdown.Popover placement='bottom end'>
                                                <Dropdown.Menu aria-label={`Actions for ${row.name}`}>
                                                    {rowActions(row, handlers)}
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
    </Table>
);

export default ApplicationsTable;
