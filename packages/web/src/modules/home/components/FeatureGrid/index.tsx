import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

const COLUMNS = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4'
} as const;

interface FeatureGridProps{
    columns: keyof typeof COLUMNS;
    flush?: boolean;
    children: ReactNode;
}

/*
 * The 1px gaps show the separator behind the cells, so the hairlines meet without doubling up.
 * flush drops the outer border for a grid that runs edge to edge inside a band.
 */
const FeatureGrid = ({ columns, flush = false, children }: FeatureGridProps) => (
    <div className={cn('grid gap-px overflow-hidden bg-separator', flush ? 'border-t border-separator' : 'border border-separator', COLUMNS[columns])}>{children}</div>
);

export default FeatureGrid;
