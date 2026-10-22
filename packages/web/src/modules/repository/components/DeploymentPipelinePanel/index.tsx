import { Button, Spinner } from '@heroui/react';
import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const stepIcon = (level: ActivityLevel) => {
    switch(level){
        case ActivityLevel.Progress:
            return <Spinner size='sm' color='current' className='text-muted' />;
        case ActivityLevel.Success:
            return <CheckCircle2 aria-hidden='true' className='size-4 shrink-0 text-foreground' />;
        case ActivityLevel.Error:
            return <XCircle aria-hidden='true' className='size-4 shrink-0 text-danger' />;
        default:
            return <CircleDashed aria-hidden='true' className='size-4 shrink-0 text-muted' />;
    }
};

const formatStepDuration = (durationMs: number): string =>
    durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`;

const stepDurationMs = (event: ActivityEvent): number | null => {
    const value = event.meta.durationMs;
    return typeof value === 'number' ? value : null;
};

const stepIndex = (event: ActivityEvent): number | null => {
    const value = event.meta.stepIndex;
    return typeof value === 'number' ? value : null;
};

const sortSteps = (events: ActivityEvent[]): ActivityEvent[] =>
    [...events].sort((a, b) => {
        const indexA = stepIndex(a);
        const indexB = stepIndex(b);
        return indexA === null || indexB === null ? 0 : indexA - indexB;
    });

interface PipelineStepProps{
    event: ActivityEvent;
}

const PipelineStep = ({ event }: PipelineStepProps) => {
    const duration = stepDurationMs(event);

    return (
        <li className='flex items-center gap-3 border-t border-separator px-5 py-3 first:border-t-0'>
            {stepIcon(event.level)}
            <span className='flex-1 truncate text-[0.875rem] text-foreground'>{event.title}</span>
            {duration !== null && <span className='font-mono text-[0.8125rem] text-muted'>{formatStepDuration(duration)}</span>}
        </li>
    );
};

interface PipelineLogsProps{
    lines: string[];
}

const PipelineLogs = ({ lines }: PipelineLogsProps) => {
    if(lines.length === 0) return null;

    return (
        <details className='border-t border-separator px-5 py-3'>
            <summary className='label-caps cursor-pointer text-muted transition-colors hover:text-foreground motion-reduce:transition-none'>
                Raw logs
            </summary>
            <pre className='mt-3 max-h-64 overflow-y-auto font-mono text-[0.75rem] whitespace-pre-wrap text-muted'>{lines.join('\n')}</pre>
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
    const ordered = sortSteps(steps);

    return (
        <div className='mt-6 border border-border'>
            <div className='flex items-center gap-3 border-b border-border px-5 py-3.5'>
                {!done ? (
                    <Spinner size='sm' color='current' className='text-muted' />
                ) : hasError ? (
                    <XCircle aria-hidden='true' className='size-4 shrink-0 text-danger' />
                ) : (
                    <CheckCircle2 aria-hidden='true' className='size-4 shrink-0 text-foreground' />
                )}

                <span className='label-caps flex-1 text-muted'>
                    {!done ? 'Deploying your application' : hasError ? 'Deployment failed' : 'Deployment finished'}
                </span>

                {done && <Button size='sm' variant='ghost' onPress={onDismiss}>Dismiss</Button>}
            </div>

            <ol>
                {ordered.length === 0 ? (
                    <li className='flex items-center gap-3 px-5 py-3 text-[0.875rem] text-muted'>
                        <Spinner size='sm' color='current' />
                        Queued — waiting for the build to start…
                    </li>
                ) : (
                    ordered.map((event) => <PipelineStep key={event.id} event={event} />)
                )}
            </ol>

            <PipelineLogs lines={logs} />
        </div>
    );
};

export default DeploymentPipelinePanel;
