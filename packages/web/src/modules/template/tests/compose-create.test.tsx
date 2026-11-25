import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CreateStack from '@/modules/template/pages/protected/Compose/Create';
import { templateInstallApi } from '@/modules/template/api/api';
import { githubApi } from '@/modules/github/api/api';
import { useTenantStore } from '@/shared/store/tenant';
import { resetStores } from '@/shared/tests/store-reset';
import { respondWith } from '@/shared/tests/fetch-stub';
import { COMPOSE_STARTER } from '@/modules/template/utils/compose-starter';
import type { Root } from 'react-dom/client';
import type { Project } from '@quantum/contracts/modules/project/domain';
import type { GithubRepository } from '@quantum/contracts/modules/github/domain';

const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigate,
    Link: ({ children }: { children: unknown }) => children
}));

const PROJECT: Project = {
    id: 7, name: 'Shop', slug: 'shop', isDefault: true, organizationId: 3,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
};

const LEARN: GithubRepository = {
    name: 'learn', fullName: 'pollium/learn', owner: 'pollium', private: true, defaultBranch: 'main',
    htmlUrl: 'https://github.com/pollium/learn', description: null, branches: ['main', 'dev']
};

let container: HTMLDivElement | undefined;
let root: Root | undefined;

const settle = async (rounds = 8) => {
    for(let i = 0; i < rounds; i += 1) await act(async () => undefined);
};

const render = async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root?.render(<CreateStack />); });
    await settle();
};

const button = (label: string): HTMLButtonElement => {
    const found = [...(container?.querySelectorAll('button') ?? [])].find((node) => node.textContent?.includes(label));
    if(!found) throw new Error(`no ${label} button`);
    return found as HTMLButtonElement;
};

const type = async (input: HTMLInputElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
        input.focus();
        setter?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await settle(3);
};

const inputLabelled = (label: string): HTMLInputElement => {
    const input = container?.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`);
    if(!input) throw new Error(`no ${label} input`);
    return input;
};

afterEach(async () => {
    await act(async () => { root?.unmount(); });
    container?.remove();
    navigate.mockReset();
    vi.restoreAllMocks();
    resetStores();
});

describe('deploy a stack', () => {
    const stub = () => {
        useTenantStore.getState().setOrganizationId(3);
        respondWith(200, { data: [PROJECT] });
    };

    it('starts from a repository, reads its compose file and deploys with the variables it needs', async () => {
        stub();
        vi.spyOn(githubApi, 'account').mockResolvedValue({ organizationAccessUrl: 'https://github.com/settings/connections/applications/abc', scopes: ['repo', 'user', 'read:packages'] } as never);
        vi.spyOn(githubApi, 'repositories').mockResolvedValue([LEARN]);
        vi.spyOn(templateInstallApi, 'inspectSource').mockResolvedValue({
            composeFiles: ['docker-compose.yml', 'compose.dokploy.yml'],
            composePath: 'docker-compose.yml',
            variables: [{ name: 'DATABASE_URL', required: true }, { name: 'JWT_SECRET', required: true }, { name: 'PG_VERSION', required: false }],
            problem: null
        });
        const create = vi.spyOn(templateInstallApi, 'createFromSource').mockResolvedValue({ id: 11 } as never);
        await render();

        const combo = container?.querySelector('input');
        expect(combo?.getAttribute('placeholder')).toContain('Search your repositories');
        expect(container?.querySelector('a[href="https://github.com/settings/connections/applications/abc"]')).not.toBeNull();

        await type(combo as HTMLInputElement, 'learn');
        const option = [...document.querySelectorAll('[role="option"]')].find((node) => node.textContent?.includes('pollium/learn'));
        expect(option).toBeDefined();
        await act(async () => { (option as HTMLElement).click(); });
        await settle();

        expect(container?.textContent).toContain('pollium/learn');
        expect(container?.textContent).toContain('DATABASE_URL');
        expect(button('Deploy').disabled).toBe(true);

        await type(inputLabelled('DATABASE_URL'), 'postgres://db/learn');
        expect(button('Deploy').disabled).toBe(true);

        const generate = container?.querySelector('button[aria-label="Generate JWT_SECRET"]') as HTMLButtonElement | null;
        expect(generate).not.toBeNull();
        expect(container?.querySelector('button[aria-label="Generate DATABASE_URL"]')).toBeNull();
        await act(async () => { generate?.click(); });
        await settle();
        expect(inputLabelled('JWT_SECRET').value).toMatch(/^[0-9a-f]{64}$/);
        expect(button('Deploy').disabled).toBe(false);

        await act(async () => { button('Deploy').click(); });
        await settle();

        expect(create).toHaveBeenCalledWith({
            path: { projectId: 7 },
            body: {
                name: 'learn', owner: 'pollium', repo: 'learn', branch: 'main', composePath: 'docker-compose.yml',
                deployOn: 'push', variables: { DATABASE_URL: 'postgres://db/learn', JWT_SECRET: expect.stringMatching(/^[0-9a-f]{64}$/) }
            }
        });
        expect(navigate).toHaveBeenCalledWith('/installs/11/services');
    });

    it('still lets you paste a compose file and waits for a name before deploying', async () => {
        stub();
        vi.spyOn(githubApi, 'account').mockResolvedValue({} as never);
        vi.spyOn(githubApi, 'repositories').mockResolvedValue([]);
        const create = vi.spyOn(templateInstallApi, 'createCompose').mockResolvedValue({ id: 12 } as never);
        await render();

        await act(async () => { button('Paste a compose file').click(); });
        await settle();

        const editor = container?.querySelector('[data-monaco="yaml"]') as HTMLTextAreaElement | null;
        expect(editor?.value).toBe(COMPOSE_STARTER);
        expect(button('Deploy').disabled).toBe(true);

        await type(inputLabelled('Name'), 'shop');
        expect(button('Deploy').disabled).toBe(false);

        await act(async () => { button('Deploy').click(); });
        await settle();

        expect(create).toHaveBeenCalledWith({ path: { projectId: 7 }, body: { name: 'shop', compose: COMPOSE_STARTER } });
        expect(navigate).toHaveBeenCalledWith('/applications?project=7');
    });
});
