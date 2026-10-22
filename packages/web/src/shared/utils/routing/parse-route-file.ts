import { defineErrors } from '@/shared/errors/define-errors';
import type { ParsedRoute, RouteTier } from '@/shared/contracts/routing/route';

const RouteError = defineErrors({
    domain: 'Route',
    causes: {
        InvalidPageFile: 500
    }
} as const);

const ROUTE_FILE = /\/modules\/([^/]+)\/pages\/(guest|public|protected)\/(.*?)(index|layout)\.tsx$/;

const toKebab = (segment: string): string =>
    segment
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();

const toSegment = (raw: string): string => {
    const param = raw.match(/^\[(.+)\]$/);
    if(param) return `:${param[1]}`;
    return toKebab(raw);
};

export const parseRouteFile = (file: string): ParsedRoute => {
    const match = ROUTE_FILE.exec(file);
    if(!match) throw RouteError.InvalidPageFile(file);

    const [, , tier, rest, filename] = match;
    const segments = rest.split('/').filter(Boolean).map(toSegment);
    const path = segments.length ? `/${segments.join('/')}` : '/';

    return {
        tier: tier as RouteTier,
        kind: filename === 'layout' ? 'layout' : 'page',
        path
    };
};
