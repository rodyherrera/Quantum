import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string | number>{
    value: T;
    label: ReactNode;
}

interface SegmentedProps<T extends string | number>{
    label: string;
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    isDisabled?: boolean;
}

const Segmented = <T extends string | number>({ label, options, value, onChange, isDisabled = false }: SegmentedProps<T>) => (
    <div role='radiogroup' aria-label={label} className='inline-flex max-w-full shrink-0 gap-0.5 overflow-x-auto rounded-[0.4375rem] border border-separator bg-surface-secondary p-0.5'>
        {options.map((option) => {
            const active = option.value === value;

            return (
                <button
                    key={option.value}
                    type='button'
                    role='radio'
                    aria-checked={active}
                    disabled={isDisabled}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[0.3125rem] px-2.5 text-xs font-medium transition-colors disabled:opacity-50 motion-reduce:transition-none [&>svg]:size-3.5',
                        active ? 'bg-background text-foreground shadow-[0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.18)]' : 'text-muted hover:text-foreground'
                    )}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);

export default Segmented;
