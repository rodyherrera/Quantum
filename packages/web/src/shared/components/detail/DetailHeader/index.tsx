import type { ReactNode } from 'react';

interface DetailHeaderProps{
    icon: ReactNode;
    title: ReactNode;
    meta?: ReactNode;
    actions?: ReactNode;
    error?: ReactNode;
}

const DetailHeader = ({ icon, title, meta, actions, error }: DetailHeaderProps) => (
    <div className='flex flex-wrap items-start gap-x-6 gap-y-4 px-5 pt-6 sm:px-7'>
        <div className='flex min-w-60 flex-1 flex-col gap-1.5'>
            <h2 className='flex min-w-0 items-center gap-2.5 text-[1.375rem] font-semibold leading-tight tracking-[-0.018em] text-foreground'>
                {icon}
                <span className='min-w-0 flex-1'>{title}</span>
            </h2>
            {error}
            {meta !== undefined && (
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-muted [&_svg]:shrink-0'>{meta}</div>
            )}
        </div>

        {actions !== undefined && <div className='flex flex-col items-start gap-2 lg:items-end'>{actions}</div>}
    </div>
);

export default DetailHeader;
