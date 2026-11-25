import { useState } from 'react';
import { cn } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface ListGroupProps{
    label: string;
    count: number;
    icon?: ReactNode;
    children: ReactNode;
}

/* A collapsible group header that sticks under the page bar while its rows scroll. */
const ListGroup = ({ label, count, icon, children }: ListGroupProps) => {
    const [open, setOpen] = useState(true);

    return (
        <section aria-label={label}>
            <h2 className='sticky top-[var(--bar-height)] z-10 border-b border-separator bg-surface-secondary'>
                <button
                    type='button'
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                    className='flex h-9 w-full items-center gap-2 px-2.5 text-left font-medium text-foreground'
                >
                    <ChevronDown
                        aria-hidden='true'
                        className={cn('size-3 shrink-0 text-subtle transition-transform motion-reduce:transition-none', !open && '-rotate-90')}
                    />
                    {icon}
                    <span>{label}</span>
                    <span className='font-normal tabular-nums text-subtle'>{count}</span>
                </button>
            </h2>

            {open && children}
        </section>
    );
};

export default ListGroup;
