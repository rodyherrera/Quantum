import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import DeploymentsTable from '@/modules/repository/components/DeploymentsTable';
import { DeploymentStatus } from '@quantum/contracts/modules/deployment/domain';
import type { Root } from 'react-dom/client';
import type { Deployment, DeploymentArtifact } from '@quantum/contracts/modules/deployment/domain';

const deployment = (id: number, status: DeploymentStatus, artifact: DeploymentArtifact | null, error: string | null = null): Deployment => ({
    id, repositoryId: 3, userId: 1, organizationId: 1, githubDeploymentId: null, status, error, artifact, url: null, environmentVariables: {},
    commit: { message: `change ${id}`, author: { name: 'Acme', email: '' }, date: '2026-01-01T00:00:00.000Z' },
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
});

const EXEC_ARTIFACT = { image: '', tag: '', digest: 'a3f9c21d8e7b6a5f4c3b2a1908f7e6d5c4b3a291', builder: 'exec', sizeBytes: 0 };
const IMAGE_ARTIFACT = { image: 'quantum/3:12', tag: 'quantum/3:12', digest: 'sha256:9b1e44c0ffee', builder: 'dockerfile', sizeBytes: 1 };

let container: HTMLDivElement | undefined;
let root: Root | undefined;

const render = async (deployments: Deployment[]) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root?.render(<DeploymentsTable deployments={deployments} onRollback={() => undefined} onDelete={() => undefined} />); });
};

afterEach(async () => {
    await act(async () => { root?.unmount(); });
    container?.remove();
});

describe('deployments table', () => {
    it('shows the short revision of each build, commit or image', async () => {
        await render([deployment(2, DeploymentStatus.Success, EXEC_ARTIFACT), deployment(1, DeploymentStatus.Success, IMAGE_ARTIFACT)]);

        const text = container?.textContent ?? '';
        expect(text).toContain('a3f9c21');
        expect(text).toContain('9b1e44c');
        expect(text).not.toContain('sha256');
    });

    it('names a status that is not a success and keeps the error in full', async () => {
        await render([deployment(5, DeploymentStatus.Failure, null, 'npm run build exited with code 1')]);

        const text = container?.textContent ?? '';
        expect(text).toContain('Failed');
        expect(text).toContain('npm run build exited with code 1');
        expect(container?.querySelector('[aria-label="Actions for deployment #5"]')).not.toBeNull();
    });
});
