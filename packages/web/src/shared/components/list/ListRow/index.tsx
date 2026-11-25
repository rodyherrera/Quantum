import { Link } from 'react-router-dom';
import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

interface ListRowProps{
    children: ReactNode;
    className?: string;
    to?: string;
    label?: string;
}

/*
 * A 40px grid row. With `to`, the whole row is a link: the anchor stretches over the row and the
 * row's own buttons and links sit above it, so they keep working.
 */
const ListRow = ({ children, className, to, label }: ListRowProps) => (
    <div className={cn('relative grid min-h-10 items-center gap-3 border-b border-separator px-4 transition-colors hover:bg-default motion-reduce:transition-none', className)}>
        {to !== undefined && (
            <Link to={to} aria-label={label} className='absolute inset-0 outline-none focus-visible:bg-default focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent' />
        )}
        <div className='contents [&_a]:relative [&_button]:relative'>{children}</div>
    </div>
);

export default ListRow;
