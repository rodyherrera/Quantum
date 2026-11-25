import { installStatusColor, installStatusLabel, isInstallTransient } from '@/modules/template/utils/install-status';
import { databaseStatusColor, databaseStatusLabel, isDatabaseTransient } from '@/modules/application/utils/status';
import { containerStatusColor, containerStatusLabel, isContainerTransient } from '@/modules/application/utils/container-status';
import type { StatusColor } from '@/shared/utils/status';
import type { ContainerAddress } from '@quantum/contracts/modules/docker/domain';
import type { Database } from '@quantum/contracts/modules/database/domain';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall, TemplateInstallService } from '@quantum/contracts/modules/template/domain';

export type Row =
    | { kind: 'app'; key: string; name: string; subtitle: string; date: string; repository: Repository }
    | { kind: 'database'; key: string; name: string; subtitle: string; date: string; database: Database }
    | { kind: 'install'; key: string; name: string; subtitle: string; date: string; install: TemplateInstall };

export type RowKind = 'repository' | 'database' | 'stack' | 'template';

export type KindFilter = 'all' | RowKind;

export type RowState = 'deploying' | 'failed' | 'running' | 'stopped';

export interface RowStatus{
    color: StatusColor;
    label: string;
    isTransient: boolean;
}

export interface RowGroup{
    state: RowState;
    rows: Row[];
}

const installSubtitle = (install: TemplateInstall): string => {
    if(install.source !== null) return `${install.source.owner}/${install.source.repo} · ${install.source.branch}`;
    return install.compose === null ? 'Template' : 'Docker Compose';
};

export const buildRows = (repositories: Repository[], databases: Database[], installs: TemplateInstall[]): Row[] => [
    ...repositories.map((repository): Row => ({
        kind: 'app',
        key: `app-${repository.id}`,
        name: repository.name,
        subtitle: repository.owner !== null ? `${repository.owner} · ${repository.branch}` : repository.branch,
        date: repository.createdAt,
        repository
    })),
    ...databases.map((database): Row => ({
        kind: 'database',
        key: `database-${database.id}`,
        name: database.name,
        subtitle: database.version !== null ? `${database.engine} · ${database.version}` : database.engine,
        date: database.createdAt,
        database
    })),
    ...installs.map((install): Row => ({
        kind: 'install',
        key: `install-${install.id}`,
        name: install.name,
        subtitle: installSubtitle(install),
        date: install.createdAt,
        install
    }))
];

export const kindOf = (row: Row): RowKind => {
    if(row.kind === 'app') return 'repository';
    if(row.kind === 'database') return 'database';
    return row.install.compose === null ? 'template' : 'stack';
};

export const countKinds = (rows: Row[]): Record<KindFilter, number> => {
    const counts: Record<KindFilter, number> = { all: rows.length, repository: 0, stack: 0, database: 0, template: 0 };
    for(const row of rows) counts[kindOf(row)] += 1;
    return counts;
};

export const statusOf = (row: Row): RowStatus => {
    if(row.kind === 'app'){
        const status = row.repository.containerStatus;
        return { color: containerStatusColor(status), label: containerStatusLabel(status), isTransient: isContainerTransient(status) };
    }

    if(row.kind === 'database'){
        const status = row.database.status;
        return { color: databaseStatusColor(status), label: databaseStatusLabel(status), isTransient: isDatabaseTransient(status) };
    }

    const status = row.install.status;
    return { color: installStatusColor(status), label: installStatusLabel(status), isTransient: isInstallTransient(status) };
};

export const stateOf = (row: Row): RowState => {
    const { color, isTransient } = statusOf(row);
    if(isTransient) return 'deploying';
    if(color === 'danger') return 'failed';
    return color === 'success' ? 'running' : 'stopped';
};

/* Attention first: what is changing, then what broke, then what is fine. */
const STATE_ORDER: readonly RowState[] = ['deploying', 'failed', 'running', 'stopped'];

export const STATE_STATUS: Record<RowState, RowStatus> = {
    deploying: { color: 'warning', label: 'Deploying', isTransient: true },
    failed: { color: 'danger', label: 'Failed', isTransient: false },
    running: { color: 'success', label: 'Running', isTransient: false },
    stopped: { color: 'default', label: 'Stopped', isTransient: false }
};

export const groupRows = (rows: Row[]): RowGroup[] =>
    STATE_ORDER
        .map((state) => ({ state, rows: rows.filter((row) => stateOf(row) === state) }))
        .filter((group) => group.rows.length > 0);

export const linkOf = (row: Row): string | undefined => {
    if(row.kind === 'app') return `/repositories/${row.repository.id}/deployments`;
    if(row.kind === 'install') return `/installs/${row.install.id}/services`;
    return undefined;
};

const primaryService = (install: TemplateInstall): TemplateInstallService | undefined =>
    install.services.find((service) => service.kind === 'app' && service.ports.length > 0)
        ?? install.services.find((service) => service.kind === 'app')
        ?? install.services[0];

export const addressOf = (row: Row): ContainerAddress | null => {
    if(row.kind === 'app') return row.repository.address;
    if(row.kind === 'database') return row.database.address;
    return primaryService(row.install)?.address ?? null;
};
