import type { ReactNode } from 'react';

const COLUMNS = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4'
} as const;

interface FeatureGridProps{
    columns: keyof typeof COLUMNS;
    children: ReactNode;
}

/* The 1px gaps show the separator behind the cells, so the hairlines meet without doubling up. */
const FeatureGrid = ({ columns, children }: FeatureGridProps) => (
    <div className={`grid gap-px overflow-hidden rounded-xl border border-separator bg-separator ${COLUMNS[columns]}`}>{children}</div>
);

export default FeatureGrid;
