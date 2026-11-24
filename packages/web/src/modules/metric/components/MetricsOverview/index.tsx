import StatTile from '@/shared/components/StatTile';
import StatBand from '@/shared/components/StatBand';
import BarChart from '@/shared/components/board/BarChart';
import BoardSection from '@/shared/components/board/BoardSection';
import BoardSplit from '@/shared/components/board/BoardSplit';
import { formatBytes } from '@/shared/utils/format-bytes';
import { formatClock } from '@/shared/utils/format-date';
import { count, rate } from '@/shared/utils/format-metrics';
import { deltas } from '@/modules/metric/utils/series';
import type { BarDatum } from '@/shared/components/board/BarChart';
import type { Metric } from '@quantum/contracts/modules/metric/domain';

interface MetricsOverviewProps{
    samples: Metric[];
    latest: Metric;
}

const percent = (value: number): string => `${rate(value)}%`;

const MetricsOverview = ({ samples, latest }: MetricsOverviewProps) => {
    const labels = samples.map((sample) => formatClock(sample.ts));
    const series = (values: number[], offset = 0): BarDatum[] =>
        values.map((value, index) => ({ label: labels[index + offset] ?? '', value }));

    const cpu = series(samples.map((sample) => sample.cpuPercent));
    const memory = series(samples.map((sample) => sample.memUsage));
    const received = series(deltas(samples.map((sample) => sample.netRx)), 1);
    const sent = series(deltas(samples.map((sample) => sample.netTx)), 1);

    const peak = cpu.reduce((top, datum) => (datum.value > top.value ? datum : top), cpu[0] ?? { label: '—', value: 0 });
    const networkTop = Math.max(0, ...received.map((datum) => datum.value), ...sent.map((datum) => datum.value));
    const memoryTop = Math.max(0, ...memory.map((datum) => datum.value)) * 1.25;

    return (
        <>
            <StatBand columns={5}>
                <StatTile label='CPU' value={percent(latest.cpuPercent)} hint={`Peak ${percent(peak.value)} at ${peak.label}`} />
                <StatTile label='Memory' value={formatBytes(latest.memUsage)} hint={`${percent(latest.memPercent)} of ${formatBytes(latest.memLimit)}`} />
                <StatTile label='Network in' value={formatBytes(latest.netRx)} hint='Since the container started' />
                <StatTile label='Network out' value={formatBytes(latest.netTx)} hint='Since the container started' />
                <StatTile label='Processes' value={count(latest.pids)} hint='Running in the container' />
            </StatBand>

            <BoardSection title='CPU' meta={`${samples.length} ${samples.length === 1 ? 'sample' : 'samples'} · peak ${percent(peak.value)}`}>
                <BarChart title='CPU' data={cpu} format={percent} height={170} />
            </BoardSection>

            <BoardSplit layout='thirds'>
                <BoardSection title='Memory' meta={`${formatBytes(latest.memUsage)} now`}>
                    <BarChart title='Memory' data={memory} format={formatBytes} height={90} max={memoryTop} dense />
                </BoardSection>

                <BoardSection title='Network in' meta='Between samples'>
                    <BarChart title='Network in' data={received} format={formatBytes} height={90} max={networkTop} dense />
                </BoardSection>

                <BoardSection title='Network out' meta='Same scale as in'>
                    <BarChart title='Network out' data={sent} format={formatBytes} height={90} max={networkTop} dense />
                </BoardSection>
            </BoardSplit>
        </>
    );
};

export default MetricsOverview;
