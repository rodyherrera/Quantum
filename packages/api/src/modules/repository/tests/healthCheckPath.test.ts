import { describe, expect, it } from 'vitest';
import { normalizeHealthCheckPath } from '../services/healthCheckPath';

describe('normalizeHealthCheckPath', () => {
    it('treats a blank path as no health check', () => {
        expect(normalizeHealthCheckPath('')).toBeNull();
        expect(normalizeHealthCheckPath('   ')).toBeNull();
    });

    it('keeps a path rooted at the app', () => {
        expect(normalizeHealthCheckPath('/health')).toBe('/health');
        expect(normalizeHealthCheckPath(' healthz ')).toBe('/healthz');
        expect(normalizeHealthCheckPath('/api/ready?deep=1')).toBe('/api/ready?deep=1');
    });
});
