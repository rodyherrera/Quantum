import { cn, EmptyStateRoot, Spinner } from '@heroui/react';
import type { ReactNode } from 'react';

interface EmptyStateProps{
    title: string;
    description?: string;
    compact?: boolean;
    isBusy?: boolean;
    children?: ReactNode;
}

const EmptyState = ({
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
        {isBusy && <Spinner size='sm' color='current' className='mb-4 text-muted' />}

        <h2 className='text-sm font-semibold text-foreground'>{title}</h2>

        {description && <p className='mt-1.5 max-w-sm text-muted'>{description}</p>}

        {children && <div className='mt-5'>{children}</div>}
    </EmptyStateRoot>
);

export default EmptyState;
