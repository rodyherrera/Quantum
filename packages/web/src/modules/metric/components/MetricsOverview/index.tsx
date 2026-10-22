import StatTile from '@/shared/components/StatTile';
import StatBand from '@/shared/components/StatBand';
import Sparkline from '@/shared/components/charts/Sparkline';
import UsageOverTime from '@/modules/metric/components/UsageOverTime';
import { formatBytes } from '@/shared/utils/format-bytes';
import { count, rate } from '@/shared/utils/format-metrics';
import type { Metric } from '@quantum/contracts/modules/metric/domain';

interface MetricsOverviewProps{
    samples: Metric[];
    latest: Metric;
}

const MetricsOverview = ({ samples, latest }: MetricsOverviewProps) => (
    <div className='flex flex-col gap-10'>
        <StatBand columns={5}>
            <StatTile label='CPU' value={`${rate(latest.cpuPercent)}%`} hint='Current sample'>
                <Sparkline values={samples.map((sample) => sample.cpuPercent)} />
            </StatTile>

            <StatTile
                label='Memory'
                value={`${rate(latest.memPercent)}%`}
                hint={`${formatBytes(latest.memUsage)} of ${formatBytes(latest.memLimit)}`}
            >
                <Sparkline values={samples.map((sample) => sample.memPercent)} />
            </StatTile>

            <StatTile label='Network in' value={formatBytes(latest.netRx)} hint='Since start' />
            <StatTile label='Network out' value={formatBytes(latest.netTx)} hint='Since start' />
            <StatTile label='Processes' value={count(latest.pids)} hint='Running in the container' />
        </StatBand>

        <UsageOverTime samples={samples} />
    </div>
);

export default MetricsOverview;
