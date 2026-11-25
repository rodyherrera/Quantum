import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import PersistentVolumes from '@/modules/repository/components/PersistentVolumes';
import { repositoryApi } from '@/modules/repository/api/api';
import { BuildStrategy, SourceType } from '@quantum/contracts/modules/repository/domain';
import type { Root } from 'react-dom/client';
import type { Repository } from '@quantum/contracts/modules/repository/domain';

const repository = (volumes: string[]): Repository => ({
    id: 3, name: 'Shop', alias: 'shop', owner: null, branch: 'main', webhookId: null, buildCommand: '', installCommand: '',
    startCommand: 'npm start', rootDirectory: '/', framework: null, runtime: 'node', runtimeVersion: null, outputDirectory: null,
    buildStrategy: BuildStrategy.Exec, dockerfilePath: null, image: null, url: 'https://github.com/acme/shop', port: 3000, healthCheckPath: null,
    containerStatus: null, ports: [], address: null, volumes, userId: 1, organizationId: 1, projectId: 1, sourceType: SourceType.Github,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
});

let container: HTMLDivElement | undefined;
let root: Root | undefined;

const render = async (volumes: string[]) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root?.render(<PersistentVolumes repository={repository(volumes)} onSaved={() => undefined} />); });
    for(let i = 0; i < 4; i += 1) await act(async () => undefined);
};

const button = (label: string): HTMLButtonElement => {
    const found = [...(container?.querySelectorAll('button') ?? [])].find((node) => node.textContent?.includes(label));
    if(!found) throw new Error(`no ${label} button`);
    return found as HTMLButtonElement;
};

afterEach(async () => {
    await act(async () => { root?.unmount(); });
    container?.remove();
    vi.restoreAllMocks();
});

describe('persistent volumes', () => {
    it('lists the saved paths and keeps the save disabled until something changes', async () => {
        await render(['/data', '/var/lib/app/uploads']);

        const inputs = [...(container?.querySelectorAll('input') ?? [])].map((node) => (node as HTMLInputElement).value);
        expect(inputs).toEqual(['/data', '/var/lib/app/uploads']);
        expect(button('Save and redeploy').disabled).toBe(true);
    });

    it('sends the remaining paths after a removal', async () => {
        const update = vi.spyOn(repositoryApi, 'update').mockResolvedValue(repository(['/data']) as never);
        await render(['/data', '/var/lib/app/uploads']);

        const remove = container?.querySelector('[aria-label="Remove /var/lib/app/uploads"]');
        if(!(remove instanceof HTMLButtonElement)) throw new Error('no remove button');
        await act(async () => { remove.click(); });
        expect(button('Save and redeploy').disabled).toBe(false);
        await act(async () => { button('Save and redeploy').click(); });
        for(let i = 0; i < 4; i += 1) await act(async () => undefined);

        expect(update).toHaveBeenCalledWith({ path: { id: 3 }, body: { volumes: ['/data'] } });
    });
});
