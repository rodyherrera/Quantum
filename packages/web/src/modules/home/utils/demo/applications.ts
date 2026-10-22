import { buildRows } from '@/modules/application/utils/application-rows';
import { address, entity, minutesAgo } from '@/modules/home/utils/demo/entities';
import { BuildStrategy, SourceType } from '@quantum/contracts/modules/repository/domain';
import { ContainerStatus, PortBindingProtocol } from '@quantum/contracts/modules/docker/domain';
import { DatabaseEngine, DatabaseStatus } from '@quantum/contracts/modules/database/domain';
import { TemplateInstallStatus } from '@quantum/contracts/modules/template/domain';
import type { Database } from '@quantum/contracts/modules/database/domain';
import type { Row } from '@/modules/application/utils/application-rows';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall, TemplateInstallService } from '@quantum/contracts/modules/template/domain';

const OWNER = 'acme';

const SCOPE = { userId: 1, organizationId: 1, projectId: 1 };

interface RepositorySeed{
    id: number;
    name: string;
    framework: string;
    status: ContainerStatus;
    ip: string;
    externalPort: number;
    minutes: number;
}

const repository = ({ id, name, framework, status, ip, externalPort, minutes }: RepositorySeed): Repository => ({
    ...entity(id, minutes),
    ...SCOPE,
    name,
    alias: `${OWNER}/${name}`,
    owner: OWNER,
    branch: 'main',
    webhookId: String(48_213_990 + id),
    buildCommand: 'npm run build',
    installCommand: 'npm ci',
    startCommand: 'npm start',
    rootDirectory: '/',
    framework,
    runtime: 'node',
    runtimeVersion: '24',
    outputDirectory: null,
    buildStrategy: BuildStrategy.Dockerfile,
    dockerfilePath: 'Dockerfile',
    image: null,
    url: `https://github.com/${OWNER}/${name}.git`,
    port: 3000,
    containerStatus: status,
    ports: [{ internalPort: 3000, externalPort, protocol: PortBindingProtocol.Tcp }],
    address: address(ip, `repository-${id}`),
    volumes: [],
    sourceType: SourceType.Github
});

interface DatabaseSeed{
    id: number;
    name: string;
    engine: DatabaseEngine;
    version: string;
    ip: string;
    minutes: number;
}

const database = ({ id, name, engine, version, ip, minutes }: DatabaseSeed): Database => ({
    ...entity(id, minutes),
    ...SCOPE,
    name,
    engine,
    version,
    nodeId: 'local',
    status: DatabaseStatus.Running,
    containerId: 20 + id,
    backups: [{ id: '2026-10-21-0400', path: `/backups/${name}/2026-10-21-0400.dump`, sizeBytes: 18_234_112, createdAt: minutesAgo(240) }],
    address: address(ip, `database-${id}`)
});

const service = (name: string, kind: TemplateInstallService['kind'], image: string, ip: string, ports: [number, number][] = []): TemplateInstallService => ({
    name,
    kind,
    image,
    containerId: null,
    ports: ports.map(([externalPort, internalPort]) => ({ internalPort, externalPort, protocol: 'tcp' })),
    address: address(ip, `stack-${name}`)
});

export const STACK_SERVICES: TemplateInstallService[] = [
    service('postgres', 'database', 'postgres:18-alpine', '172.30.0.10'),
    service('redis', 'app', 'redis:7-alpine', '172.30.0.11'),
    service('api', 'app', 'quantum-stack-9-api:4be1c07a9e2d', '172.30.0.12', [[20004, 8080]]),
    service('web', 'app', 'quantum-stack-9-web:4be1c07a9e2d', '172.30.0.13', [[20005, 80]])
];

interface InstallSeed{
    id: number;
    name: string;
    compose: string | null;
    status: TemplateInstallStatus;
    services: TemplateInstallService[];
    minutes: number;
}

const install = ({ id, name, compose, status, services, minutes }: InstallSeed): TemplateInstall => ({
    ...entity(id, minutes),
    ...SCOPE,
    name,
    templateId: compose === null ? id : null,
    compose,
    nodeId: 'local',
    status,
    networkId: 3,
    services,
    environment: {},
    source: compose === null ? null : { owner: OWNER, repo: 'shop', branch: 'main', composePath: 'compose.yml', deployOn: 'push' }
});

const REPOSITORIES = [
    repository({ id: 12, name: 'storefront', framework: 'Next.js', status: ContainerStatus.Running, ip: '172.30.0.7', externalPort: 20001, minutes: 4_320 }),
    repository({ id: 14, name: 'docs', framework: 'Astro', status: ContainerStatus.Building, ip: '172.30.0.8', externalPort: 20006, minutes: 960 })
];

const DATABASES = [
    database({ id: 3, name: 'orders', engine: DatabaseEngine.Postgres, version: '16-alpine', ip: '172.30.0.2', minutes: 10_080 }),
    database({ id: 4, name: 'sessions', engine: DatabaseEngine.Redis, version: '7', ip: '172.30.0.3', minutes: 7_200 })
];

const INSTALLS = [
    install({ id: 9, name: 'shop', compose: 'services: {}', status: TemplateInstallStatus.Running, services: STACK_SERVICES, minutes: 2_880 }),
    install({
        id: 6,
        name: 'n8n',
        compose: null,
        status: TemplateInstallStatus.Running,
        services: [
            service('app', 'app', 'docker.n8n.io/n8nio/n8n:latest', '172.30.0.5', [[20002, 5678]]),
            service('postgres', 'database', 'postgres:latest', '172.30.0.4')
        ],
        minutes: 5_760
    }),
    install({
        id: 7,
        name: 'Uptime Kuma',
        compose: null,
        status: TemplateInstallStatus.Stopped,
        services: [service('app', 'app', 'louislam/uptime-kuma:1', '172.30.0.6', [[20003, 80]])],
        minutes: 8_640
    })
];

export const DEMO_CONNECTION_STRING = 'postgresql://qdb_7f3a91c2:hQ2v9XkLr0sTz4Wm8bYc1nPe6dGfJ3aU@postgres-orders-3f9a:5432/postgres_9b41d7e0';

export const DEMO_ROWS = buildRows(REPOSITORIES, DATABASES, INSTALLS);

export const databaseRows = (status: DatabaseStatus): Row[] =>
    buildRows([], DATABASES.map((entry, index) => (index === 0 ? { ...entry, status } : entry)), []);
