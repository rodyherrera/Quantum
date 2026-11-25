import { MONO_LABEL } from '@/modules/home/utils/classes';
import type { ComponentType, ReactNode } from 'react';

interface FeatureCellProps{
    icon: ComponentType<{ className?: string }>;
    title: string;
    body: ReactNode;
    children?: ReactNode;
}

const FeatureCell = ({ icon: Icon, title, body, children }: FeatureCellProps) => (
    <article className='grid min-w-0 content-start gap-3 bg-background px-5.5 pb-7 pt-6 sm:px-6'>
        <h3 className={`${MONO_LABEL} flex items-center gap-2.5 text-foreground`}>
            <Icon aria-hidden='true' className='size-3.5 shrink-0 text-subtle' />
            {title}
        </h3>

        <p className='leading-[1.6] text-muted'>{body}</p>

        {children !== undefined && <div className='mt-2 flex min-w-0 flex-wrap gap-1.5'>{children}</div>}
    </article>
);

export default FeatureCell;
