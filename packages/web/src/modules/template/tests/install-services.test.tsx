import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import InstallServices from '@/modules/template/pages/protected/Installs/[installId]/Services';
import { resetStores } from '@/shared/tests/store-reset';
import { respondWith } from '@/shared/tests/fetch-stub';
import { TemplateInstallStatus } from '@quantum/contracts/modules/template/domain';
import type { Root } from 'react-dom/client';
import type { TemplateInstall } from '@quantum/contracts/modules/template/domain';

const INSTALL: TemplateInstall = {
    id: 4, templateId: null, compose: 'services: {}', name: 'pollium', organizationId: 3, projectId: 7, userId: 1,
    nodeId: 'local', status: TemplateInstallStatus.Running, networkId: 2, environment: {}, source: null,
    services: [
        { name: 'gateway', kind: 'app', image: 'ghcr.io/pollium/learn-gateway:main', containerId: 31, address: { ip: '10.9.0.4', hostname: 'install-4-gateway' }, ports: [{ internalPort: 8080, externalPort: 20001, protocol: 'tcp' }] },
        { name: 'redis', kind: 'app', image: 'redis:7', containerId: 32, address: null, ports: [] }
    ],
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
};

vi.mock('react-router-dom', () => ({
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
    resetStores();
});

describe('install services', () => {
    it('lists every service with its image, address and ports published on the server address', async () => {
        respondWith(200, { data: { host: '203.0.113.10' } });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => { root?.render(<InstallServices />); });
        await settle();

        const text = container.textContent ?? '';
        expect(text).toContain('gateway');
        expect(text).toContain('ghcr.io/pollium/learn-gateway:main');
        expect(text).toContain('10.9.0.4');
        expect(text).toContain('Internal only');

        const link = container.querySelector('a[href="http://203.0.113.10:20001"]');
        expect(link?.getAttribute('aria-label')).toContain('203.0.113.10:20001');
        expect(link?.textContent).toContain('8080');
    });
});
