import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

interface StatBandProps{
    columns: 2 | 3 | 4 | 5;
    children: ReactNode;
}

const COLUMNS: Record<StatBandProps['columns'], string> = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5'
};

/* The strip of headline figures across the top of a dashboard. */
const StatBand = ({ columns, children }: StatBandProps) => (
    <section
        className={cn(
            'grid grid-cols-2 border-b border-separator [&>*]:border-separator [&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t',
            'lg:[&>*+*]:border-l lg:[&>*:nth-child(n+3)]:border-t-0',
            COLUMNS[columns]
        )}
    >
        {children}
    </section>
);

export default StatBand;
