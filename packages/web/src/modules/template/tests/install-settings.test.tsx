import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import InstallSettings from '@/modules/template/pages/protected/Installs/[installId]/Settings';
import { templateInstallApi } from '@/modules/template/api/api';
import { resetStores } from '@/shared/tests/store-reset';
import { TemplateInstallStatus } from '@quantum/contracts/modules/template/domain';
import type { Root } from 'react-dom/client';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const INSTALL: TemplateInstall = {
    id: 4, templateId: null, compose: 'services: {}', name: 'learn', organizationId: 3, projectId: 7, userId: 1,
    nodeId: 'local', status: TemplateInstallStatus.Running, networkId: 2, environment: {}, services: [],
    source: { owner: 'pollium', repo: 'learn', branch: 'main', composePath: 'docker-compose.yml', deployOn: 'push' },
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
};

vi.mock('react-router-dom', () => ({
    useParams: () => ({ installId: '4' }),
    useOutletContext: () => INSTALL
}));

let container: HTMLDivElement | undefined;
let root: Root | undefined;

const settle = async (rounds = 8) => {
    for(let i = 0; i < rounds; i += 1) await act(async () => undefined);
};

afterEach(async () => {
    await act(async () => { root?.unmount(); });
    container?.remove();
    vi.restoreAllMocks();
    resetStores();
});

describe('stack settings', () => {
    it('shows where the stack comes from and the variables its compose file uses', async () => {
        vi.spyOn(templateInstallApi, 'variables').mockResolvedValue({ DATABASE_URL: 'postgres://db/learn' });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => { root?.render(<InstallSettings />); });
        await settle();

        expect(container.textContent).toContain('pollium/learn');
        const inputs = [...container.querySelectorAll('input')].map((input) => input.value);
        expect(inputs).toContain('main');
        expect(inputs).toContain('docker-compose.yml');
        expect(inputs).toContain('DATABASE_URL');
        expect(inputs).toContain('postgres://db/learn');
    });

    it('masks secret values until you reveal them, and can still generate one', async () => {
        vi.spyOn(templateInstallApi, 'variables').mockResolvedValue({ DATABASE_URL: 'postgres://db/learn', POSTGRES_PASSWORD: 'Zp7Lq2vX' });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => { root?.render(<InstallSettings />); });
        await settle();

        const valueOf = (value: string) => [...(container?.querySelectorAll('input') ?? [])].find((input) => input.value === value);
        expect(valueOf('postgres://db/learn')?.type).toBe('text');
        expect(valueOf('Zp7Lq2vX')?.type).toBe('password');
        expect(container.querySelector('button[aria-label="Show DATABASE_URL"]')).toBeNull();
        expect(container.querySelector('button[aria-label="Generate POSTGRES_PASSWORD"]')).not.toBeNull();

        await act(async () => { container?.querySelector<HTMLButtonElement>('button[aria-label="Show POSTGRES_PASSWORD"]')?.click(); });
        await settle();

        expect(valueOf('Zp7Lq2vX')?.type).toBe('text');
        expect(container.querySelector('button[aria-label="Hide POSTGRES_PASSWORD"]')).not.toBeNull();
    });
});
