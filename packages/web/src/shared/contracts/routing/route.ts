import type { ComponentType } from 'react';

export type RouteTier = 'guest' | 'public' | 'protected';

export type RouteKind = 'page' | 'layout';

export interface PageModule{
    default: ComponentType;
}

export type PageLoader = () => Promise<PageModule>;

export interface ParsedRoute{
    tier: RouteTier;
    kind: RouteKind;
    path: string;
}

export interface DiscoveredRoute extends ParsedRoute{
    load: PageLoader;
}
