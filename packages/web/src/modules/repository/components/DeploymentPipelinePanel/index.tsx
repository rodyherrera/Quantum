import { Button, Spinner } from '@heroui/react';
import { STATUS_TONE } from '@/shared/utils/status-tone';
import { activityLevelLabel } from '@/modules/activity/utils/level';
import { formatStepDuration, pipelineSteps, stepDurationMs } from '@/modules/repository/utils/deployment-steps';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { CSSProperties } from 'react';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const STEP_FILL: Record<ActivityLevel, string> = {
    [ActivityLevel.Info]: 'w-full bg-subtle',
    [ActivityLevel.Success]: 'w-full bg-muted',
    [ActivityLevel.Progress]: 'w-1/2 animate-pulse bg-foreground motion-reduce:animate-none',
    [ActivityLevel.Warn]: 'w-full bg-muted',
    [ActivityLevel.Error]: 'w-full bg-danger'
};

interface PipelineStepProps{
    event: ActivityEvent;
}

const PipelineStep = ({ event }: PipelineStepProps) => {
    const duration = stepDurationMs(event);

    return (
        <li className='grid min-w-0 gap-1.5'>
            <span aria-hidden='true' className='h-1 overflow-hidden rounded-full bg-separator'>
                <span className={`block h-full rounded-full ${STEP_FILL[event.level]}`} />
            </span>

            <span className='min-w-0 truncate text-xs font-medium text-foreground'>
                <span className='sr-only'>{activityLevelLabel(event.level)}: </span>
                {event.title}
            </span>

            {duration !== null && <span className='text-xs tabular-nums text-subtle'>{formatStepDuration(duration)}</span>}
        </li>
    );
};

interface PipelineLogsProps{
    lines: string[];
}

const PipelineLogs = ({ lines }: PipelineLogsProps) => {
    if(lines.length === 0) return null;

    return (
        <details className='border-t border-separator px-3.5 py-2.5'>
            <summary className='cursor-pointer text-xs font-medium text-muted transition-colors hover:text-foreground motion-reduce:transition-none'>
                Raw logs
            </summary>
            <pre className='mt-2.5 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-separator bg-surface-secondary p-3 font-mono text-xs text-muted'>
                {lines.join('\n')}
            </pre>
        </details>
    );
};

interface DeploymentPipelinePanelProps{
    steps: ActivityEvent[];
    logs: string[];
    done: boolean;
    onDismiss: () => void;
}

const DeploymentPipelinePanel = ({ steps, logs, done, onDismiss }: DeploymentPipelinePanelProps) => {
    const hasError = steps.some((event) => event.level === ActivityLevel.Error);
    const ordered = pipelineSteps(steps);
    const title = !done ? 'Deploying your application' : hasError ? 'Deployment failed' : 'Deployment finished';

    return (
        <section aria-label='Current deployment' className='min-w-0 rounded-lg border border-separator bg-surface'>
            <header className='flex min-h-[2.625rem] flex-wrap items-center gap-2 border-b border-separator px-3.5 py-1.5'>
                <h3 className={`flex-1 font-semibold ${STATUS_TONE[!done ? 'warning' : hasError ? 'danger' : 'success']}`}>{title}</h3>
                {done && <Button size='sm' variant='ghost' onPress={onDismiss}>Dismiss</Button>}
            </header>

            {ordered.length === 0 ? (
                <p className='flex items-center gap-2 px-3.5 py-3 text-muted'>
                    <Spinner size='sm' color='current' />
                    Queued — waiting for the build to start…
                </p>
            ) : (
                <ol
                    className='flex flex-col gap-3 px-3.5 pb-3.5 pt-3 sm:grid sm:gap-0.5 sm:[grid-template-columns:var(--steps)]'
                    style={{ '--steps': `repeat(${ordered.length}, minmax(0, 1fr))` } as CSSProperties}
                >
                    {ordered.map((event) => <PipelineStep key={event.id} event={event} />)}
                </ol>
            )}

            <PipelineLogs lines={logs} />
        </section>
    );
};

export default DeploymentPipelinePanel;
