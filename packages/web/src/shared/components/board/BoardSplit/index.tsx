import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

const LAYOUT = {
    halves: 'lg:grid-cols-2',
    thirds: 'lg:grid-cols-3',
    main: 'lg:grid-cols-[minmax(0,1.8fr)_minmax(17.5rem,1fr)]'
} as const;

interface BoardSplitProps{
    layout?: keyof typeof LAYOUT;
    children: ReactNode;
}

/* Board sections side by side, separated by a vertical hairline; stacked on narrow screens. */
const BoardSplit = ({ layout = 'halves', children }: BoardSplitProps) => (
    <div
        className={cn(
            'grid border-b border-separator [&>section]:border-b-0 [&>section+section]:border-t [&>section+section]:border-separator lg:[&>section+section]:border-l lg:[&>section+section]:border-t-0',
            LAYOUT[layout]
        )}
    >
        {children}
    </div>
);

export default BoardSplit;
