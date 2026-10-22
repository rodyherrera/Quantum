import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartPanel from '@/shared/components/charts/ChartPanel';
import ChartLegend from '@/shared/components/charts/ChartLegend';
import ChartTooltip from '@/shared/components/charts/ChartTooltip';
import { AXIS, CURSOR, GRID_STROKE } from '@/shared/components/charts/axes';
import { formatBytes } from '@/shared/utils/format-bytes';
import { formatDate } from '@/shared/utils/format-date';
import { rate } from '@/shared/utils/format-metrics';
import type { Metric } from '@quantum/contracts/modules/metric/domain';

const clockLabel = (iso: string): string => {
    const at = new Date(iso);
    return Number.isNaN(at.getTime())
        ? '—'
        : at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

interface MetricTooltipProps{
    active?: boolean;
    payload?: Array<{ payload: Metric }>;
}

const MetricTooltip = ({ active, payload }: MetricTooltipProps) => {
    const point = payload?.[0]?.payload;
    if(active !== true || point === undefined) return null;

    return (
        <ChartTooltip
            title={formatDate(point.ts)}
            rows={[
                { label: 'CPU', value: `${rate(point.cpuPercent)}%` },
                { label: 'Memory', value: `${rate(point.memPercent)}%` },
                { label: 'Used', value: formatBytes(point.memUsage) }
            ]}
        />
    );
};

interface UsageOverTimeProps{
    samples: Metric[];
}

const LEGEND = [
    { label: 'CPU %', className: 'bg-foreground' },
    { label: 'Memory %', className: 'bg-muted' }
];

const UsageOverTime = ({ samples }: UsageOverTimeProps) => (
    <ChartPanel title='Utilisation' meta={`${samples.length} ${samples.length === 1 ? 'sample' : 'samples'}`}>
        <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={samples} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                    <XAxis dataKey='ts' tickFormatter={clockLabel} minTickGap={32} {...AXIS} />
                    <YAxis domain={[0, 100]} unit='%' width={44} {...AXIS} />
                    <Tooltip content={<MetricTooltip />} cursor={CURSOR} />
                    <Area
                        type='monotone'
                        dataKey='cpuPercent'
                        stroke='var(--foreground)'
                        strokeWidth={2}
                        fill='var(--foreground)'
                        fillOpacity={0.1}
                        dot={false}
                        activeDot={{ r: 4, fill: 'var(--foreground)', stroke: 'var(--background)', strokeWidth: 2 }}
                    />
                    <Area
                        type='monotone'
                        dataKey='memPercent'
                        stroke='var(--muted)'
                        strokeWidth={2}
                        fill='var(--muted)'
                        fillOpacity={0.08}
                        dot={false}
                        activeDot={{ r: 4, fill: 'var(--muted)', stroke: 'var(--background)', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        <ChartLegend entries={LEGEND} />
    </ChartPanel>
);

export default UsageOverTime;
