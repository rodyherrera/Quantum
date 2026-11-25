import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const numberMeta = (event: ActivityEvent, key: string): number | null => {
    const value = event.meta[key];
    return typeof value === 'number' ? value : null;
};

const stepKey = (event: ActivityEvent): string => {
    const index = numberMeta(event, 'stepIndex');
    return index === null ? `event:${event.id}` : `step:${index}`;
};

export const stepDurationMs = (event: ActivityEvent): number | null => numberMeta(event, 'durationMs');

export const formatStepDuration = (durationMs: number): string =>
    durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`;

/* A step reports once when it starts and again when it ends, so each step keeps only its newest report. */
export const pipelineSteps = (events: ActivityEvent[]): ActivityEvent[] => {
    const latest = new Map<string, ActivityEvent>();
    for(const event of events){
        const known = latest.get(stepKey(event));
        if(known === undefined || known.id < event.id) latest.set(stepKey(event), event);
    }

    return [...latest.values()].sort((a, b) => {
        const indexA = numberMeta(a, 'stepIndex');
        const indexB = numberMeta(b, 'stepIndex');
        return indexA === null || indexB === null ? 0 : indexA - indexB;
    });
};
