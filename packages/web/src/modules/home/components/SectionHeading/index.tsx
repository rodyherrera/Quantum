import { cn } from '@heroui/react';
import { MONO_LABEL, MONO_TITLE } from '@/modules/home/utils/classes';
import type { ReactNode } from 'react';

interface SectionHeadingProps{
    id: string;
    index: string;
    label: string;
    title: string;
    lead: ReactNode;
    className?: string;
}

const SectionHeading = ({ id, index, label, title, lead, className }: SectionHeadingProps) => (
    <header className={cn('grid max-w-[47.5rem] gap-4', className)}>
        <p className={`${MONO_LABEL} text-subtle`}>
            <span className='text-foreground'>{index}</span>
            <span aria-hidden='true' className='mx-2'>/</span>
            {label}
        </p>

        <h2 id={id} className={`${MONO_TITLE} text-[length:clamp(1.5rem,3.4vw,2.375rem)] leading-[1.08] tracking-[-0.02em]`}>{title}</h2>

        <p className='max-w-[60ch] text-[0.9375rem] leading-[1.6] text-muted'>{lead}</p>
    </header>
);

export default SectionHeading;
