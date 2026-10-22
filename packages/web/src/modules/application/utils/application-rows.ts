import type { Database } from '@quantum/contracts/modules/database/domain';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

export type Row =
    | { kind: 'app'; key: string; name: string; subtitle: string; date: string; repository: Repository }
    | { kind: 'database'; key: string; name: string; subtitle: string; date: string; database: Database }
    | { kind: 'install'; key: string; name: string; subtitle: string; date: string; install: TemplateInstall };

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
        subtitle: install.compose === null ? 'Template' : 'Docker Compose',
        date: install.createdAt,
        install
    }))
];
