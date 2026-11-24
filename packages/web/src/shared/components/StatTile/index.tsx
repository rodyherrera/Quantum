import type { ReactNode } from 'react';

interface StatTileProps{
    label: string;
    value: ReactNode;
    hint?: string;
}

const StatTile = ({ label, value, hint }: StatTileProps) => (
    <section className='flex min-w-0 flex-col gap-0.5 px-5 py-4'>
        <h2 className='truncate text-muted'>{label}</h2>
        <p className='flex min-w-0 items-center gap-2 truncate text-[1.375rem] font-medium leading-snug tracking-[-0.015em] tabular-nums text-foreground'>{value}</p>
        {hint !== undefined && <p className='truncate text-xs text-subtle'>{hint}</p>}
    </section>
);

export default StatTile;
