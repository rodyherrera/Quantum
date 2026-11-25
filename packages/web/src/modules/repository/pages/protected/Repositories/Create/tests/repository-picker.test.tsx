import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import CreateRepository from '@/modules/repository/pages/protected/Repositories/Create';
import { githubApi } from '@/modules/github/api/api';
import type { Root } from 'react-dom/client';
import type { GithubAccount, GithubRepository } from '@quantum/contracts/modules/github/domain';

const repository = (fullName: string, isPrivate = false): GithubRepository => ({
    name: fullName.split('/')[1],
    fullName,
    owner: fullName.split('/')[0],
    private: isPrivate,
    defaultBranch: 'main',
    htmlUrl: `https://github.com/${fullName}`,
    description: null,
    branches: ['main']
});

const REPOS = [
    repository('rodyherrera/Quantum'),
    repository('rodyherrera/CodexDrake'),
    repository('jinwolf2/gyaru_frontend', true)
];

const ACCOUNT = { id: 1, userId: 1, githubId: '1', username: 'rodyherrera', avatarUrl: null, organizationAccessUrl: null, scopes: ['repo', 'user'],
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' } satisfies GithubAccount;

let container: HTMLDivElement | undefined;
let root: Root | undefined;

const render = async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => { root?.render(<MemoryRouter><CreateRepository /></MemoryRouter>); });
    for(let i = 0; i < 12; i += 1) await act(async () => undefined);
};

const input = (): HTMLInputElement => {
    const found = container?.querySelector('input');
    if(!found) throw new Error('no input rendered');
    return found as HTMLInputElement;
};

const options = (): string[] =>
    [...document.querySelectorAll('[role="option"]')].map((node) => node.textContent ?? '');

const type = async (value: string) => {
    const field = input();
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

    await act(async () => {
        field.focus();
        setter?.call(field, value);
        field.dispatchEvent(new Event('input', { bubbles: true }));
    });
    for(let i = 0; i < 8; i += 1) await act(async () => undefined);
};

afterEach(async () => {
    await act(async () => { root?.unmount(); });
    container?.remove();
    container = undefined;
    root = undefined;
    vi.restoreAllMocks();
});

describe('repository picker', () => {
    const stub = () => {
        vi.spyOn(githubApi, 'account').mockResolvedValue(ACCOUNT as never);
        vi.spyOn(githubApi, 'repositories').mockResolvedValue(REPOS as never);
    };

    it('offers a single text field instead of one row per repository', async () => {
        stub();
        await render();

        expect(container?.querySelectorAll('input')).toHaveLength(1);
        const labels = [...(container?.querySelectorAll('button') ?? [])].map((node) => node.textContent ?? '');
        expect(labels.some((label) => label.includes('rodyherrera/Quantum'))).toBe(false);
    });

    it('narrows the options to what was typed', async () => {
        stub();
        await render();

        await type('codex');

        const shown = options();
        expect(shown.some((option) => option.includes('CodexDrake'))).toBe(true);
        expect(shown.some((option) => option.includes('Quantum'))).toBe(false);
        expect(shown.some((option) => option.includes('gyaru'))).toBe(false);
    });

    it('matches on the owner too, so owner/name both work', async () => {
        stub();
        await render();

        await type('jinwolf');

        const shown = options();
        expect(shown).toHaveLength(1);
        expect(shown[0]).toContain('jinwolf2/gyaru_frontend');
    });
});
