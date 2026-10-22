import { beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = 'quantum.guide';

const loadStore = async () => {
    vi.resetModules();
    const { useGuideStore } = await import('@/modules/home/store/guide');
    return useGuideStore;
};

describe('useGuideStore', () => {
    beforeEach(() => localStorage.clear());

    it('picks up where the reader left off', async () => {
        localStorage.setItem(KEY, JSON.stringify({ setup: 'domain', ip: '198.51.100.7', domain: 'deploy.acme.dev', done: ['domain.terminal'] }));

        const state = (await loadStore()).getState();

        expect([state.setup, state.ip, state.domain, state.done]).toEqual(['domain', '198.51.100.7', 'deploy.acme.dev', ['domain.terminal']]);
    });

    it('starts over instead of trusting progress it cannot read', async () => {
        localStorage.setItem(KEY, JSON.stringify({ setup: 'local', ip: '', domain: '', done: [] }));

        const state = (await loadStore()).getState();

        expect([state.setup, state.ip, state.domain, state.done]).toEqual(['ip', '', '', []]);
    });

    it('saves every change, so a reload keeps it', async () => {
        const store = await loadStore();

        store.getState().choose('domain');
        store.getState().toggle('domain.start');
        store.getState().toggle('domain.account');
        store.getState().toggle('domain.start');

        expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({ setup: 'domain', ip: '', domain: '', done: ['domain.account'] });
    });
});
