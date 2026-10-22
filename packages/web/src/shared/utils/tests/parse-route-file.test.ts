import { describe, expect, it } from 'vitest';
import { parseRouteFile } from '@/shared/utils/routing/parse-route-file';

describe('parseRouteFile', () => {
    it('maps a dynamic segment folder to a route param', () => {
        expect(parseRouteFile('/src/modules/applications/pages/protected/Applications/[id]/index.tsx'))
            .toEqual({ tier: 'protected', kind: 'page', path: '/applications/:id' });
    });

    it('keeps a static sibling distinct from its dynamic child', () => {
        expect(parseRouteFile('/src/modules/applications/pages/protected/Applications/index.tsx'))
            .toEqual({ tier: 'protected', kind: 'page', path: '/applications' });
        expect(parseRouteFile('/src/modules/applications/pages/protected/Applications/[id]/index.tsx'))
            .toEqual({ tier: 'protected', kind: 'page', path: '/applications/:id' });
    });

    it('kebab-cases every other segment and drops the module name', () => {
        expect(parseRouteFile('/src/modules/auth/pages/protected/ChangePassword/index.tsx'))
            .toEqual({ tier: 'protected', kind: 'page', path: '/change-password' });
    });

    it('reads the tier from the directory, not the module', () => {
        expect(parseRouteFile('/src/modules/auth/pages/guest/SignIn/index.tsx'))
            .toEqual({ tier: 'guest', kind: 'page', path: '/sign-in' });
    });

    it('reads a public page at the root of its tier as the site root', () => {
        expect(parseRouteFile('/src/modules/home/pages/public/index.tsx'))
            .toEqual({ tier: 'public', kind: 'page', path: '/' });
        expect(parseRouteFile('/src/modules/home/pages/public/GetStarted/index.tsx'))
            .toEqual({ tier: 'public', kind: 'page', path: '/get-started' });
    });

    it('reads a layout as the same path as the page beside it', () => {
        const directory = '/src/modules/applications/pages/protected/Applications/[appId]';

        expect(parseRouteFile(`${directory}/layout.tsx`))
            .toEqual({ tier: 'protected', kind: 'layout', path: '/applications/:appId' });
        expect(parseRouteFile(`${directory}/index.tsx`))
            .toEqual({ tier: 'protected', kind: 'page', path: '/applications/:appId' });
    });

    it('refuses a file that is not a page instead of silently skipping it', () => {
        expect(() => parseRouteFile('/src/modules/auth/hooks/use-session.ts'))
            .toThrow('Route::InvalidPageFile');
    });
});
