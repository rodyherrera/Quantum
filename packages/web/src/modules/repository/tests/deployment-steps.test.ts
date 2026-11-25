import { describe, expect, it } from 'vitest';
import { pipelineSteps } from '@/modules/repository/utils/deployment-steps';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const event = (id: number, level: ActivityLevel, title: string, meta: Record<string, unknown>): ActivityEvent => ({
    id, organizationId: 1, userId: 1, scope: 'repository', level, title, message: '', source: 'orchestrator.deploy', correlationId: '7',
    meta, ts: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z'
});

describe('pipeline steps', () => {
    it('keeps the newest report of each step, in step order', () => {
        const steps = pipelineSteps([
            event(4, ActivityLevel.Success, 'Building application', { stepIndex: 1, durationMs: 4800 }),
            event(3, ActivityLevel.Progress, 'Building application', { stepIndex: 1 }),
            event(2, ActivityLevel.Success, 'Provisioning infrastructure', { stepIndex: 0, durationMs: 1200 }),
            event(1, ActivityLevel.Progress, 'Provisioning infrastructure', { stepIndex: 0 })
        ]);

        expect(steps.map((step) => [step.title, step.level])).toEqual([
            ['Provisioning infrastructure', ActivityLevel.Success],
            ['Building application', ActivityLevel.Success]
        ]);
    });

    it('lets a live report replace the one loaded with the page', () => {
        const steps = pipelineSteps([
            event(1, ActivityLevel.Progress, 'Building application', { stepIndex: 0 }),
            event(2, ActivityLevel.Error, 'Building application', { stepIndex: 0, durationMs: 900 })
        ]);

        expect(steps).toHaveLength(1);
        expect(steps[0]?.level).toBe(ActivityLevel.Error);
    });

    it('keeps reports without a step index apart', () => {
        const steps = pipelineSteps([
            event(1, ActivityLevel.Info, 'Queued', {}),
            event(2, ActivityLevel.Info, 'Picked up', {})
        ]);

        expect(steps.map((step) => step.title)).toEqual(['Queued', 'Picked up']);
    });
});
