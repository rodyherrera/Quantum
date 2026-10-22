import { useRef } from 'react';
import MetricsOverview from '@/modules/metric/components/MetricsOverview';
import { useInView } from '@/modules/home/hooks/use-in-view';
import { useLiveSamples } from '@/modules/home/hooks/use-live-samples';

const SAMPLES = 40;

const OperateMetrics = () => {
    const frame = useRef<HTMLDivElement>(null);
    const isVisible = useInView(frame);
    const samples = useLiveSamples(SAMPLES, isVisible);
    const latest = samples.at(-1);

    return (
        <div ref={frame}>
            {latest !== undefined && <MetricsOverview samples={samples} latest={latest} />}
        </div>
    );
};

export default OperateMetrics;
