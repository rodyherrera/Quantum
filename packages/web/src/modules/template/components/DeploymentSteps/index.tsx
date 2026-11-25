import { cn } from '@heroui/react';
import { STATUS_TONE } from '@/shared/utils/status-tone';
import { activityLevelColor, activityLevelLabel } from '@/modules/activity/utils/level';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';
import type { StatusColor } from '@/shared/utils/status';

const BAR: Record<StatusColor, string> = {
    success: 'bg-muted',
    warning: 'bg-muted',
    danger: 'bg-danger',
    accent: 'bg-muted',
    default: 'bg-border'
};

const RUNNING_BAR = 'bg-[linear-gradient(90deg,var(--foreground)_55%,var(--border)_55%)]';

const duration = (event: ActivityEvent): string | null => {
    const ms = event.meta.durationMs;
    if(typeof ms !== 'number') return null;
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
};

const Step = ({ step }: { step: ActivityEvent }) => {
    const running = step.level === ActivityLevel.Progress;
    const color = activityLevelColor(step.level);

    return (
        <li className='flex min-w-0 flex-col gap-2'>
            <span aria-hidden='true' className={cn('h-1 rounded-sm', running ? RUNNING_BAR : BAR[color])} />
            <div className='flex min-w-0 flex-col gap-1 pr-3 text-xs'>
                <span className='min-w-0 break-words font-medium text-foreground'>{step.title}</span>
                <span className={cn('tabular-nums', color === 'default' || color === 'success' ? 'text-subtle' : STATUS_TONE[color])}>
                    {running ? activityLevelLabel(step.level) : duration(step) ?? activityLevelLabel(step.level)}
                </span>
                {step.message !== '' && <span className='break-words text-muted'>{step.message}</span>}
            </div>
        </li>
    );
};

interface DeploymentStepsProps{
    steps: ActivityEvent[];
}

const DeploymentSteps = ({ steps }: DeploymentStepsProps) => (
    <section aria-label='Deployment progress' aria-live='polite' className='min-w-0 rounded-lg border border-separator bg-surface'>
        <h3 className='border-b border-separator px-4 py-2.5 font-semibold text-foreground'>Deployment</h3>
        <ol className='grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-0.5 gap-y-4 px-4 pb-3.5 pt-3'>
            {steps.map((step) => <Step key={step.id} step={step} />)}
        </ol>
    </section>
);

export default DeploymentSteps;
