import { cn, EmptyStateRoot } from '@heroui/react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps{
    icon?: LucideIcon;
    title: string;
    description?: string;
    compact?: boolean;
    isBusy?: boolean;
    children?: ReactNode;
}

const EmptyState = ({
    icon: Icon,
    title,
    description,
    compact = false,
    isBusy = false,
    children
}: EmptyStateProps) => (
    <EmptyStateRoot
        role={isBusy ? 'status' : undefined}
        aria-live={isBusy ? 'polite' : undefined}
        className={cn('flex flex-col items-center px-6 text-center', compact ? 'py-10' : 'py-20')}
    >
        {Icon !== undefined && (
            <span aria-hidden='true' className='grid size-9 place-items-center rounded-lg border border-border bg-surface-secondary text-muted'>
                <Icon className={cn('size-4', isBusy && 'animate-spin motion-reduce:animate-none')} />
            </span>
        )}

        <h2 className={cn('text-sm font-semibold text-foreground', Icon !== undefined && 'mt-4')}>{title}</h2>

        {description && <p className='mt-1.5 max-w-sm text-muted'>{description}</p>}

        {children && <div className='mt-5'>{children}</div>}
    </EmptyStateRoot>
);

export default EmptyState;
