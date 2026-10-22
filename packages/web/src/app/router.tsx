import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { discoverRoutes } from '@/app/routes';
import { lazyElement } from '@/app/lazy-element';
import { withViewTransitions } from '@/app/with-view-transitions';
import type { DiscoveredRoute, PageLoader, RouteTier } from '@/shared/contracts/routing/route';
import DashboardLayout from '@/app/layouts/DashboardLayout';
import GuestGuard from '@/modules/auth/components/GuestGuard';
import ProtectedGuard from '@/modules/auth/components/ProtectedGuard';
import RouteErrorBoundary from '@/shared/components/routing/RouteErrorBoundary';
import NotFound from '@/shared/components/routing/NotFound';

const depthOf = (path: string): number => path.split('/').filter(Boolean).length;

const isIndexOf = (page: DiscoveredRoute, layout: DiscoveredRoute): boolean => {
    return page.path === layout.path;
};

const isDirectChildOf = (page: DiscoveredRoute, layout: DiscoveredRoute): boolean => {
    return page.path.startsWith(`${layout.path}/`)
        && depthOf(page.path) === depthOf(layout.path) + 1;
};

const ownerOf = (page: DiscoveredRoute, layouts: DiscoveredRoute[]): DiscoveredRoute | undefined => {
    return layouts.find((layout) => isIndexOf(page, layout) || isDirectChildOf(page, layout));
};

const relative = (path: string, parent: string): string => path.slice(parent.length + 1);

const toRoute = (page: DiscoveredRoute, parent: string | null): RouteObject => {
    const path = parent === null ? page.path.replace(/^\//, '') : relative(page.path, parent);

    return path === ''
        ? { index: true, element: lazyElement(page.load) }
        : { path, element: lazyElement(page.load) };
};

const toRoutes = (list: DiscoveredRoute[], fallback: PageLoader | null = null): RouteObject[] => {
    const layouts = list.filter((route) => route.kind === 'layout');
    const pages = list.filter((route) => route.kind === 'page');

    const loose = pages.filter((page) => ownerOf(page, layouts) === undefined);

    const nested = layouts.map((layout) => ({
        path: layout.path.replace(/^\//, ''),
        element: lazyElement(layout.load),
        children: pages
            .filter((page) => ownerOf(page, layouts) === layout)
            .map((page) => toRoute(page, layout.path))
    }));

    if(fallback === null) return [...loose.map((page) => toRoute(page, null)), ...nested];

    return [...nested, { element: lazyElement(fallback), children: loose.map((page) => toRoute(page, null)) }];
};

const discovered = discoverRoutes();
const byTier = (tier: RouteTier): DiscoveredRoute[] => discovered.filter((route) => route.tier === tier);

const children: RouteObject[] = [];

const guest = toRoutes(byTier('guest'));
if(guest.length) children.push({ element: <GuestGuard />, children: guest });

children.push(...toRoutes(byTier('public')));

const loadOrgLayout: PageLoader = () => import('@/app/layouts/OrgLayout');

const protectedChildren = toRoutes(byTier('protected'), loadOrgLayout);
if(protectedChildren.length){
    children.push({
        element: <ProtectedGuard />,
        children: [{ element: <DashboardLayout />, children: protectedChildren }]
    });
}

children.push({ path: '*', element: <NotFound /> });

export const router = withViewTransitions(createBrowserRouter([
    { element: <RouteErrorBoundary />, children }
]));
