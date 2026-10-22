import { entity, minutesAgo } from '@/modules/home/utils/demo/entities';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

export interface RunStep{
    title: string;
    durationMs: number | null;
}

export interface RunScript{
    source: string;
    steps: RunStep[];
    outcome: string | null;
}

export const REPOSITORY_RUN: RunScript = {
    source: 'orchestrator.deploy',
    steps: [
        { title: 'Provisioning infrastructure', durationMs: 1_240 },
        { title: 'Building application', durationMs: 48_300 }
    ],
    outcome: null
};

export const DATABASE_RUN: RunScript = {
    source: 'orchestrator.database',
    steps: [
        { title: 'Preparing the network', durationMs: 180 },
        { title: 'Preparing the image', durationMs: 6_420 },
        { title: 'Creating the database container', durationMs: 610 },
        { title: 'Publishing the port', durationMs: 95 },
        { title: 'Starting postgres:16-alpine', durationMs: 1_830 },
        { title: 'Waiting for the database to accept connections', durationMs: 3_270 }
    ],
    outcome: 'Database ready on port 20008'
};

export const STACK_RUN: RunScript = {
    source: 'orchestrator.template',
    steps: [
        { title: 'Fetching acme/shop@main', durationMs: 2_140 },
        { title: 'Building api', durationMs: 38_600 },
        { title: 'Reusing web', durationMs: null },
        { title: 'Preparing the network', durationMs: 160 },
        { title: 'Starting postgres (postgres:18-alpine)', durationMs: 2_310 },
        { title: 'Starting redis (redis:7-alpine)', durationMs: 940 },
        { title: 'Starting api (quantum-stack-9-api:4be1c07a9e2d)', durationMs: 1_520 },
        { title: 'Starting web (quantum-stack-9-web:4be1c07a9e2d)', durationMs: 1_180 }
    ],
    outcome: 'shop is up on port 20004'
};

const RUN_ID = 1_000;

const event = (id: number, level: ActivityLevel, title: string, source: string, meta: Record<string, unknown>, ts: string, message = ''): ActivityEvent => ({
    ...entity(id, 0),
    organizationId: 1,
    userId: 1,
    scope: 'deployment',
    level,
    title,
    message,
    source,
    correlationId: String(RUN_ID),
    meta,
    ts
});

export const runAt = (script: RunScript, position: number): ActivityEvent[] => {
    const now = new Date().toISOString();
    const finished = script.steps.slice(0, position).map((step, index) =>
        event(RUN_ID + index, ActivityLevel.Success, step.title, script.source, { stepIndex: index, ...(step.durationMs === null ? {} : { durationMs: step.durationMs }) }, now));
    const current = script.steps[position];

    if(current !== undefined){
        return [...finished, event(RUN_ID + position, ActivityLevel.Progress, current.title, script.source, { stepIndex: position }, now)];
    }

    return script.outcome === null
        ? finished
        : [...finished, event(RUN_ID + position, ActivityLevel.Success, script.outcome, script.source, { stepIndex: position }, now)];
};

export const DEMO_EVENTS: ActivityEvent[] = [
    event(61, ActivityLevel.Progress, 'Building application', 'orchestrator.deploy', {}, minutesAgo(0)),
    event(60, ActivityLevel.Success, 'shop is up on port 20004', 'orchestrator.template', {}, minutesAgo(3)),
    event(59, ActivityLevel.Success, 'Database ready on port 20008', 'orchestrator.database', {}, minutesAgo(17)),
    event(58, ActivityLevel.Success, 'Backup 2026-10-21-0400 written (18234112 bytes)', 'orchestrator.database', {}, minutesAgo(240)),
    event(57, ActivityLevel.Warn, 'shop: could not register the GitHub webhook', 'template.source', {}, minutesAgo(2_885), 'Not Found. Pushes to acme/shop will not redeploy this stack.'),
    event(56, ActivityLevel.Success, 'Workspace ready on port 20007', 'orchestrator.codespace', {}, minutesAgo(3_010))
];
