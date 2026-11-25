import { describe, expect, it } from 'vitest';
import { groupRows, kindOf, stateOf } from '@/modules/application/utils/application-rows';
import { ContainerStatus } from '@quantum/contracts/modules/docker/domain';
import { DatabaseStatus } from '@quantum/contracts/modules/database/domain';
import { TemplateInstallStatus } from '@quantum/contracts/modules/template/domain';
import type { Row } from '@/modules/application/utils/application-rows';
import type { Database } from '@quantum/contracts/modules/database/domain';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const base = { subtitle: '', date: '2026-09-06T21:15:00.000Z' };

const app = (id: number, containerStatus: ContainerStatus | null): Row =>
    ({ ...base, kind: 'app', key: `app-${id}`, name: `app-${id}`, repository: { id, containerStatus } as Repository });

const database = (id: number, status: DatabaseStatus): Row =>
    ({ ...base, kind: 'database', key: `database-${id}`, name: `db-${id}`, database: { id, status } as Database });

const install = (id: number, status: TemplateInstallStatus, compose: string | null): Row =>
    ({ ...base, kind: 'install', key: `install-${id}`, name: `install-${id}`, install: { id, status, compose } as TemplateInstall });

describe('application rows', () => {
    it('folds every status into four states', () => {
        expect(stateOf(app(1, ContainerStatus.Building))).toBe('deploying');
        expect(stateOf(app(2, ContainerStatus.Error))).toBe('failed');
        expect(stateOf(app(3, ContainerStatus.Running))).toBe('running');
        expect(stateOf(app(4, null))).toBe('stopped');
        expect(stateOf(database(5, DatabaseStatus.BackingUp))).toBe('deploying');
        expect(stateOf(install(6, TemplateInstallStatus.Stopped, null))).toBe('stopped');
    });

    it('groups what needs attention first and drops empty groups', () => {
        const rows = [app(1, ContainerStatus.Running), app(2, ContainerStatus.Error), database(3, DatabaseStatus.Provisioning)];

        expect(groupRows(rows).map((group) => [group.state, group.rows.map((row) => row.key)])).toEqual([
            ['deploying', ['database-3']],
            ['failed', ['app-2']],
            ['running', ['app-1']]
        ]);
    });

    it('tells a compose stack from a one-click template', () => {
        expect(kindOf(install(1, TemplateInstallStatus.Running, 'services: {}'))).toBe('stack');
        expect(kindOf(install(2, TemplateInstallStatus.Running, null))).toBe('template');
        expect(kindOf(database(3, DatabaseStatus.Running))).toBe('database');
    });
});
