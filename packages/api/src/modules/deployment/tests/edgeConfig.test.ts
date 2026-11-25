import { describe, expect, it } from 'vitest';
import { edgeConfig, edgeName } from '../orchestrator/Edge';
import { PortBindingProtocol } from '@quantum/contracts/modules/docker/domain';

const bindings = [
    { internalPort: 3000, externalPort: 20008, protocol: PortBindingProtocol.Tcp },
    { internalPort: 5353, externalPort: 20009, protocol: PortBindingProtocol.Udp }
];

describe('edge', () => {
    it('is named after the app it fronts', () => {
        expect(edgeName({ dockerContainerName: 'quantum-container-production-7' })).toBe('quantum-container-production-7-edge');
    });

    it('forwards every published port to the same port of the upstream', () => {
        const config = edgeConfig('quantum-container-production-7', bindings);
        expect(config).toContain('server { listen 3000; set $app quantum-container-production-7; proxy_pass $app:3000; }');
        expect(config).toContain('server { listen 5353 udp; set $app quantum-container-production-7; proxy_pass $app:5353; }');
    });

    it('resolves the upstream again, so a restart at a new address is followed', () => {
        expect(edgeConfig('10.4.0.9', bindings)).toContain('resolver 127.0.0.11 valid=5s ipv6=off;');
    });

    it('lets old connections finish for a bounded time after a switch', () => {
        expect(edgeConfig('10.4.0.9', bindings)).toContain('worker_shutdown_timeout 30s;');
    });
});
