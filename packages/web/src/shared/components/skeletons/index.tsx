import { cn, Skeleton } from '@heroui/react';
import type { CSSProperties, ReactNode } from 'react';

const WIDTHS = ['w-2/3', 'w-1/2', 'w-1/3', 'w-3/4', 'w-1/4', 'w-1/2'];

const columnsStyle = (columns: number) => ({ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` });

interface LoadingProps{
    className?: string;
    children: ReactNode;
}

const Loading = ({ className, children }: LoadingProps) => (
    <div role='status' aria-label='Loading' aria-busy='true' className={className}>{children}</div>
);

interface TableSkeletonProps{
    rows?: number;
    columns?: number;
    className?: string;
}

export const TableSkeleton = ({ rows = 6, columns = 4, className }: TableSkeletonProps) => (
    <Loading className={cn('w-full', className)}>
        <div className='grid h-8 items-center gap-x-6 border-b border-separator px-5' style={columnsStyle(columns)}>
            {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className='h-2.5 w-16' />)}
        </div>
        {Array.from({ length: rows }, (_, row) => (
            <div key={row} className='grid h-10 items-center gap-x-6 border-b border-separator px-5' style={columnsStyle(columns)}>
                {Array.from({ length: columns }, (_, column) => (
                    <Skeleton key={column} className={cn('h-3', WIDTHS[(row + column) % WIDTHS.length])} />
                ))}
            </div>
        ))}
    </Loading>
);

interface BarSkeletonProps{
    actions?: number;
}

const BarSkeleton = ({ actions = 0 }: BarSkeletonProps) => (
    <div className='flex h-[var(--bar-height)] shrink-0 items-center gap-3 border-b border-separator px-4'>
        <Skeleton className='h-3 w-28' />
        {actions > 0 && (
            <div className='ml-auto flex gap-1.5'>
                {Array.from({ length: actions }, (_, index) => <Skeleton key={index} className='h-7 w-24' />)}
            </div>
        )}
    </div>
);

interface PageSkeletonProps{
    actions?: number;
    columns?: number;
    rows?: number;
    children?: ReactNode;
}

export const PageSkeleton = ({ actions = 0, columns = 4, rows = 6, children }: PageSkeletonProps) => (
    <Loading className='flex min-h-0 flex-1 flex-col'>
        <BarSkeleton actions={actions} />
        {children ?? <TableSkeleton rows={rows} columns={columns} />}
    </Loading>
);

interface DetailSkeletonProps{
    actions?: number;
    tabs?: number;
}

export const DetailSkeleton = ({ actions = 4, tabs = 4 }: DetailSkeletonProps) => (
    <Loading className='grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_18.75rem]'>
        <div className='flex min-w-0 flex-col'>
            <div className='flex flex-wrap items-start justify-between gap-4 px-5 pt-6 sm:px-7'>
                <div className='flex items-center gap-2.5'>
                    <Skeleton className='size-7 rounded-lg' />
                    <Skeleton className='h-6 w-56 max-w-full' />
                </div>
                <div className='flex gap-1.5'>
                    {Array.from({ length: actions }, (_, index) => <Skeleton key={index} className='h-8 w-20' />)}
                </div>
            </div>
            <div className='flex gap-2 border-b border-separator px-6 pb-2.5 pt-5'>
                {Array.from({ length: tabs }, (_, index) => <Skeleton key={index} className='h-7 w-20' />)}
            </div>
            <LinesSkeleton className='px-5 pt-6 sm:px-7' lines={4} />
        </div>
        <div className='hidden flex-col gap-3 border-l border-separator px-4 pt-6 xl:flex'>
            {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className={cn('h-3', WIDTHS[index % WIDTHS.length])} />)}
        </div>
    </Loading>
);

interface FieldsSkeletonProps{
    rows?: number;
    className?: string;
}

export const FieldsSkeleton = ({ rows = 4, className }: FieldsSkeletonProps) => (
    <Loading className={cn('flex w-full max-w-2xl flex-col gap-5', className)}>
        {Array.from({ length: rows }, (_, index) => (
            <div key={index}>
                <Skeleton className='h-2.5 w-20' />
                <Skeleton className='mt-2 h-8 w-full' />
            </div>
        ))}
    </Loading>
);

interface LinesSkeletonProps{
    lines?: number;
    className?: string;
}

export const LinesSkeleton = ({ lines = 3, className }: LinesSkeletonProps) => (
    <Loading className={cn('flex flex-col gap-3', className)}>
        {Array.from({ length: lines }, (_, index) => <Skeleton key={index} className={cn('h-3', WIDTHS[index % WIDTHS.length])} />)}
    </Loading>
);

interface BoardSkeletonProps{
    stats?: number;
}

export const BoardSkeleton = ({ stats = 4 }: BoardSkeletonProps) => (
    <div>
        <div className='grid grid-cols-2 border-b border-separator lg:[grid-template-columns:var(--columns)]' style={{ '--columns': `repeat(${stats}, minmax(0, 1fr))` } as CSSProperties}>
            {Array.from({ length: stats }, (_, index) => (
                <div key={index} className='px-5 py-4'>
                    <Skeleton className='h-2.5 w-16' />
                    <Skeleton className='mt-3 h-6 w-24' />
                    <Skeleton className='mt-2.5 h-2.5 w-28 max-w-full' />
                </div>
            ))}
        </div>
        <div className='border-b border-separator px-5 py-4'>
            <Skeleton className='h-3 w-28' />
            <Skeleton className='mt-4 h-40 w-full' />
        </div>
    </div>
);

export const SplitSkeleton = () => (
    <Loading className='flex min-h-0 flex-1 flex-col lg:flex-row'>
        <div className='flex w-full shrink-0 flex-col gap-1 border-b border-separator p-2.5 lg:w-[20.625rem] lg:border-b-0 lg:border-r'>
            <Skeleton className='mb-2 h-8 w-full' />
            {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className='flex items-center gap-2.5 px-2 py-1.5'>
                    <Skeleton className='size-7 rounded-lg' />
                    <Skeleton className={cn('h-3', WIDTHS[index % WIDTHS.length])} />
                </div>
            ))}
        </div>
        <div className='flex-1 px-9 pt-8'>
            <Skeleton className='size-11 rounded-xl' />
            <Skeleton className='mt-4 h-7 w-56 max-w-full' />
            <Skeleton className='mt-3 h-3.5 w-full max-w-lg' />
            <Skeleton className='mt-6 h-9 w-28' />
        </div>
    </Loading>
);
