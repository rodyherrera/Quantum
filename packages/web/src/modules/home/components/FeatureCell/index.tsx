import type { ComponentType, ReactNode } from 'react';

interface FeatureCellProps{
    icon: ComponentType<{ className?: string }>;
    title: string;
    body: ReactNode;
    children?: ReactNode;
}

const FeatureCell = ({ icon: Icon, title, body, children }: FeatureCellProps) => (
    <article className='grid min-w-0 content-start gap-2.5 bg-background px-5.5 pb-6.5 pt-6'>
        <span aria-hidden='true' className='mb-1 grid size-8 place-items-center rounded-lg border border-border bg-surface-secondary text-foreground'>
            <Icon className='size-4' />
        </span>

        <h3 className='text-[0.9375rem] font-semibold tracking-[-0.01em]'>{title}</h3>
        <p className='leading-[1.55] text-muted'>{body}</p>

        {children !== undefined && <div className='mt-2 flex min-w-0 flex-wrap gap-1.5'>{children}</div>}
    </article>
);

export default FeatureCell;
