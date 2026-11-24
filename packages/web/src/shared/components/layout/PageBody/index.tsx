import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

interface PageBodyProps{
    children: ReactNode;
    variant?: 'padded' | 'flush' | 'narrow';
    fill?: boolean;
    className?: string;
}

const VARIANT = {
    padded: 'px-5 py-5 sm:px-7',
    flush: '',
    narrow: 'mx-auto max-w-[46rem] px-5 pb-24 pt-10 sm:px-7'
} as const;

const PageBody = ({ children, variant = 'padded', fill = false, className }: PageBodyProps) => (
    <div className={cn('w-full', VARIANT[variant], fill && 'flex min-h-0 flex-1 flex-col', className)}>
        {children}
    </div>
);

export default PageBody;
