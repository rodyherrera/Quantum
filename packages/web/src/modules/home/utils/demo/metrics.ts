import { entity } from '@/modules/home/utils/demo/entities';
import type { Metric } from '@quantum/contracts/modules/metric/domain';

const MEMORY_LIMIT = 1_073_741_824;

const SAMPLE_INTERVAL_MS = 10_000;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

const sample = (index: number, at: number, previous: Metric | undefined): Metric => {
    const cpuPercent = clamp((previous?.cpuPercent ?? 12) + (Math.random() - 0.48) * 9, 2.4, 61);
    const memUsage = clamp((previous?.memUsage ?? 431_000_000) + (Math.random() - 0.45) * 9_000_000, 380_000_000, 520_000_000);

    return {
        ...entity(index, 0),
        organizationId: 1,
        containerId: 31,
        repositoryId: 12,
        projectId: 1,
        userId: 1,
        nodeId: 'local',
        cpuPercent: Math.round(cpuPercent * 10) / 10,
        memUsage,
        memLimit: MEMORY_LIMIT,
        memPercent: Math.round((memUsage / MEMORY_LIMIT) * 1000) / 10,
        netRx: (previous?.netRx ?? 182_000_000) + Math.round(Math.random() * 2_400_000),
        netTx: (previous?.netTx ?? 640_000_000) + Math.round(Math.random() * 6_100_000),
        blkRead: 0,
        blkWrite: 0,
        pids: 23 + Math.round(Math.random() * 3),
        ts: new Date(at).toISOString()
    };
};

export const firstSamples = (count: number): Metric[] => {
    const start = Date.now() - count * SAMPLE_INTERVAL_MS;

    return Array.from({ length: count }).reduce<Metric[]>((samples, _, index) =>
        [...samples, sample(index, start + index * SAMPLE_INTERVAL_MS, samples.at(-1))], []);
};

export const nextSamples = (samples: Metric[]): Metric[] => {
    const last = samples.at(-1);
    const at = last === undefined ? Date.now() : new Date(last.ts).getTime() + SAMPLE_INTERVAL_MS;

    return [...samples.slice(1), sample((last?.id ?? 0) + 1, at, last)];
};
