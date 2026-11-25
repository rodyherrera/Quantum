import type { ReactNode } from 'react';

interface DetailIconProps{
    children: ReactNode;
}

/* What kind of entity a page is about: one neutral tile, the same for every kind. */
const DetailIcon = ({ children }: DetailIconProps) => (
    <span aria-hidden='true' className='grid size-7 shrink-0 place-items-center rounded-[0.4375rem] border border-border bg-surface-secondary text-foreground [&>svg]:size-[0.9375rem]'>
        {children}
    </span>
);

export default DetailIcon;
