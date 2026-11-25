import { cn } from '@heroui/react';

export interface ViewTab<T extends string>{
    id: T;
    label: string;
    count?: number;
}

interface ViewTabsProps<T extends string>{
    label: string;
    items: ViewTab<T>[];
    value: T;
    onChange: (value: T) => void;
}

/* Bordered pills next to the page title that narrow what the page shows. */
const ViewTabs = <T extends string>({ label, items, value, onChange }: ViewTabsProps<T>) => (
    <div role='group' aria-label={label} className='flex items-center gap-1'>
        {items.map((item) => {
            const active = item.id === value;

            return (
                <button
                    key={item.id}
                    type='button'
                    aria-pressed={active}
                    onClick={() => onChange(item.id)}
                    className={cn(
                        'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2.5 text-xs font-medium transition-colors motion-reduce:transition-none',
                        active ? 'bg-default text-foreground' : 'text-muted hover:bg-default hover:text-foreground'
                    )}
                >
                    {item.label}
                    {item.count !== undefined && <span className='font-normal tabular-nums text-subtle'>{item.count}</span>}
                </button>
            );
        })}
    </div>
);

export default ViewTabs;
