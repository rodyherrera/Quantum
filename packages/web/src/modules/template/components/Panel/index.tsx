import type { ReactNode } from 'react';

interface PanelProps{
    title: ReactNode;
    description?: string;
    aside?: ReactNode;
    children?: ReactNode;
}

/* A bordered card with its title, a hint and its status in a header row; rows inside are split by hairlines. */
const Panel = ({ title, description, aside, children }: PanelProps) => (
    <section className='min-w-0 rounded-lg border border-separator bg-surface'>
        <header className='flex min-h-[2.625rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2'>
            <div className='min-w-0 flex-1 basis-48'>
                <h3 className='flex min-w-0 items-center gap-2 font-semibold text-foreground [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-subtle'>{title}</h3>
                {description !== undefined && <p className='mt-0.5 max-w-[60ch] text-xs text-subtle'>{description}</p>}
            </div>
            {aside !== undefined && <div className='flex shrink-0 items-center gap-3'>{aside}</div>}
        </header>

        {children !== undefined && (
            <div className='border-t border-separator [&>*+*]:border-t [&>*+*]:border-separator'>{children}</div>
        )}
    </section>
);

export default Panel;
