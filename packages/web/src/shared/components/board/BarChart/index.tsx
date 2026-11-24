import { useState } from 'react';
import { cn } from '@heroui/react';
import type { PointerEvent } from 'react';

export interface BarDatum{
    label: string;
    value: number;
}

interface BarChartProps{
    title: string;
    data: BarDatum[];
    format: (value: number) => string;
    height?: number;
    max?: number;
    dense?: boolean;
    end?: string;
}

/* Monochrome bars, the latest one lit. Hover a bar to read its value; the axis only names both ends. */
const BarChart = ({ title, data, format, height = 160, max, dense = false, end = 'Now' }: BarChartProps) => {
    const [active, setActive] = useState<number | null>(null);
    const top = max ?? Math.max(0, ...data.map((datum) => datum.value));
    const last = data.length - 1;
    const latest = data[last];

    const track = (event: PointerEvent<HTMLDivElement>) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const index = Math.floor(((event.clientX - left) / width) * data.length);
        setActive(Math.max(0, Math.min(last, index)));
    };

    const hovered = active === null ? undefined : data[active];
    const align = active === null || data.length < 2 ? 0.5 : active / last;

    return (
        <figure className='m-0'>
            <div
                role='img'
                aria-label={latest === undefined ? `${title}: no samples` : `${title}: ${data.length} samples, latest ${format(latest.value)}`}
                onPointerMove={track}
                onPointerLeave={() => setActive(null)}
                className={cn('relative flex items-end', dense ? 'gap-px' : 'gap-0.5')}
                style={{ height }}
            >
                {data.map((datum, index) => (
                    <span
                        key={`${datum.label}-${index}`}
                        aria-hidden='true'
                        className={cn(
                            'min-w-0 flex-1 rounded-t-[2px]',
                            index === active ? (index === last ? 'bg-muted' : 'bg-bar-hover') : (index === last ? 'bg-bar-current' : 'bg-bar')
                        )}
                        style={{ height: `${top === 0 ? 1.5 : Math.max(1.5, (datum.value / top) * 100)}%` }}
                    />
                ))}

                {hovered !== undefined && active !== null && (
                    <span
                        aria-hidden='true'
                        className='pointer-events-none absolute -top-8 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-overlay px-2 py-0.5 text-xs shadow-[var(--overlay-shadow)]'
                        style={{ left: `${((active + 0.5) / data.length) * 100}%`, transform: `translateX(-${align * 100}%)` }}
                    >
                        <span className='font-medium tabular-nums text-foreground'>{format(hovered.value)}</span>
                        <span className='text-subtle'>{hovered.label}</span>
                    </span>
                )}
            </div>

            {data.length > 0 && (
                <figcaption className='mt-2.5 flex justify-between text-xs tabular-nums text-subtle'>
                    <span>{data[0]?.label}</span>
                    <span>{end}</span>
                </figcaption>
            )}
        </figure>
    );
};

export default BarChart;
