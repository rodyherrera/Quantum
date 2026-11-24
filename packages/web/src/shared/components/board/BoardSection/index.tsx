import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

interface BoardSectionProps{
    title: string;
    meta?: ReactNode;
    flush?: boolean;
    children: ReactNode;
}

/* A full-bleed section of a dashboard, split from the next one by a hairline. */
const BoardSection = ({ title, meta, flush = false, children }: BoardSectionProps) => (
    <section className={cn('min-w-0 border-b border-separator', !flush && 'px-5 pb-4 pt-4')}>
        <header className={cn('flex min-w-0 items-baseline gap-3', flush ? 'px-5 py-3.5' : 'mb-3.5')}>
            <h2 className='shrink-0 font-medium text-foreground'>{title}</h2>
            {meta !== undefined && <span className='ml-auto truncate text-xs text-subtle'>{meta}</span>}
        </header>

        {children}
    </section>
);

export default BoardSection;
