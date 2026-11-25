import { useRef } from 'react';
import BarChart from '@/shared/components/board/BarChart';
import { formatClock } from '@/shared/utils/format-date';
import { rate } from '@/shared/utils/format-metrics';
import { useInView } from '@/modules/home/hooks/use-in-view';
import { useLiveSamples } from '@/modules/home/hooks/use-live-samples';

const SAMPLES = 36;

const percent = (value: number): string => `${rate(value)}%`;

const OperateMetrics = () => {
    const frame = useRef<HTMLDivElement>(null);
    const isVisible = useInView(frame);
    const samples = useLiveSamples(SAMPLES, isVisible);
    const cpu = samples.map((sample) => ({ label: formatClock(sample.ts), value: sample.cpuPercent }));

    return (
        <div ref={frame} className='w-full'>
            <BarChart title='CPU of storefront' data={cpu} format={percent} height={44} dense />
        </div>
    );
};

export default OperateMetrics;
