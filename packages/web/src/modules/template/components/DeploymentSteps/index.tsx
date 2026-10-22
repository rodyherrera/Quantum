import StatusDot from '@/shared/components/StatusDot';
import { activityLevelColor, activityLevelLabel } from '@/modules/activity/utils/level';
import { ActivityLevel } from '@quantum/contracts/modules/activity/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const duration = (event: ActivityEvent): string | null => {
    const ms = event.meta.durationMs;
    if(typeof ms !== 'number') return null;
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
};

interface DeploymentStepsProps{
    steps: ActivityEvent[];
}

const DeploymentSteps = ({ steps }: DeploymentStepsProps) => (
    <section aria-label='Deployment progress' aria-live='polite' className='flex flex-col'>
        <h2 className='text-[0.9375rem] font-medium text-foreground'>Deployment</h2>
        <ol className='mt-4 flex flex-col divide-y divide-border border-y border-border'>
            {steps.map((step) => (
                <li key={step.id} className='flex items-start justify-between gap-6 py-3'>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                        <StatusDot
                            color={activityLevelColor(step.level)}
                            label={step.title}
                            isTransient={step.level === ActivityLevel.Progress}
                        />
                        {step.message !== '' && (
                            <span className='break-words pl-[17px] text-[0.8125rem] text-muted'>{step.message}</span>
                        )}
                    </div>
                    <span className='label-caps shrink-0 text-muted'>
                        {step.level === ActivityLevel.Progress ? activityLevelLabel(step.level) : duration(step) ?? activityLevelLabel(step.level)}
                    </span>
                </li>
            ))}
        </ol>
    </section>
);

export default DeploymentSteps;
