import { parseRouteFile } from '@/shared/utils/routing/parse-route-file';
import { registerRouteLoader } from '@/shared/utils/routing/route-prefetch';
import { defineErrors } from '@/shared/errors/define-errors';
import type { DiscoveredRoute, PageLoader } from '@/shared/contracts/routing/route';

const DiscoveryError = defineErrors({
    domain: 'Discovery',
    causes: {
        DuplicateRoutePath: 500
    }
} as const);

const modules = import.meta.glob([
    '/src/modules/*/pages/{guest,public,protected}/index.tsx',
    '/src/modules/*/pages/{guest,public,protected}/**/index.tsx',
    '/src/modules/*/pages/{guest,public,protected}/**/layout.tsx'
]);

export const discoverRoutes = (): DiscoveredRoute[] => {
    const routes = Object.entries(modules).map(([file, load]) => {
        const { tier, kind, path } = parseRouteFile(file);
        return { tier, kind, path, load: load as PageLoader };
    });

    if(import.meta.env.DEV){
        const seen = new Set<string>();
        for(const route of routes){
            const key = `${route.kind} ${route.path}`;
            if(seen.has(key)) throw DiscoveryError.DuplicateRoutePath(key);
            seen.add(key);
        }
    }

    for(const route of routes) registerRouteLoader(route.path, route.load);

    return routes;
};
