import type { ReactNode } from 'react';

export interface MeterEntry{
    key: string;
    label: ReactNode;
    value: number;
    display: string;
}

interface MeterListProps{
    entries: MeterEntry[];
    max?: number;
    emptyLabel?: string;
}

/* Ranked thin bars: label, track, value. Without `max`, the largest entry fills its track. */
const MeterList = ({ entries, max, emptyLabel = 'Nothing to show yet' }: MeterListProps) => {
    if(entries.length === 0) return <p className='text-subtle'>{emptyLabel}</p>;

    const top = max ?? Math.max(0, ...entries.map((entry) => entry.value));

    return (
        <ul className='flex flex-col gap-3'>
            {entries.map((entry) => (
                <li key={entry.key} className='grid grid-cols-[minmax(4rem,8rem)_minmax(0,1fr)_3.75rem] items-center gap-2.5'>
                    <span className='flex min-w-0 items-center gap-2 truncate text-foreground'>{entry.label}</span>
                    <span aria-hidden='true' className='h-1.5 overflow-hidden rounded-full bg-border'>
                        <span
                            className='block h-full rounded-full bg-meter'
                            style={{ width: `${top === 0 ? 0 : (entry.value / top) * 100}%` }}
                        />
                    </span>
                    <span className='text-right tabular-nums text-muted'>{entry.display}</span>
                </li>
            ))}
        </ul>
    );
};

export default MeterList;
