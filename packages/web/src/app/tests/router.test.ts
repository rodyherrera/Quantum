import { describe, expect, it } from 'vitest';
import { router } from '@/app/router';
import type { RouteObject } from 'react-router-dom';

const flatten = (routes: RouteObject[]): RouteObject[] =>
    routes.flatMap((route) => [route, ...flatten(route.children ?? [])]);

const assembled = (): RouteObject[] => flatten(router.routes as RouteObject[]);

const pathsOf = (routes: RouteObject[]): (string | undefined)[] => routes.map((route) => route.path);

describe('the assembled route tree', () => {
    it('registers the guest pages', () => {
        expect(pathsOf(assembled())).toContain('sign-in');
        expect(pathsOf(assembled())).toContain('sign-up');
    });

    it('registers the protected pages', () => {
        expect(pathsOf(assembled())).toContain('applications');
        expect(pathsOf(assembled())).toContain('account');
    });

    it('wraps every protected page in one shared layout', () => {
        const layout = assembled().find((route) =>
            route.path === undefined
            && (route.children ?? []).some((child) => child.path === 'applications')
        );

        expect(layout).toBeDefined();
        expect(pathsOf(layout?.children ?? [])).toEqual(expect.arrayContaining(['applications', 'account']));
    });

    it('keeps the guest pages out of the dashboard layout', () => {
        const layout = assembled().find((route) =>
            route.path === undefined
            && (route.children ?? []).some((child) => child.path === 'applications')
        );

        expect(pathsOf(layout?.children ?? [])).not.toContain('sign-in');
    });

    it('serves the landing and the self-host guide outside both guards', () => {
        const root = router.routes[0] as RouteObject;
        const direct = root.children ?? [];

        expect(direct.some((route) => route.index === true)).toBe(true);
        expect(pathsOf(direct)).toContain('get-started');
    });

    it('ends with a catch-all for unknown paths', () => {
        const root = router.routes[0] as RouteObject;

        expect(root.children?.at(-1)?.path).toBe('*');
    });
});
