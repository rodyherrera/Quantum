import { describe, expect, it } from 'vitest';
import { router } from '@/landing/router';
import type { RouteObject } from 'react-router-dom';

const pages = (): RouteObject[] => (router.routes[0] as RouteObject).children ?? [];

describe('the landing app', () => {
    it('serves the landing and the self-host guide', () => {
        expect(pages().some((route) => route.index === true)).toBe(true);
        expect(pages().map((route) => route.path)).toContain('get-started');
    });

    it('has none of the dashboard', () => {
        expect(pages().map((route) => route.path)).not.toContain('applications');
        expect(pages().map((route) => route.path)).not.toContain('sign-in');
    });

    it('sends any other path home', () => {
        expect(pages().at(-1)?.path).toBe('*');
    });
});
