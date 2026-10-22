import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/modules/home/hooks/use-reduced-motion';
import { firstSamples, nextSamples } from '@/modules/home/utils/demo/metrics';
import type { Metric } from '@quantum/contracts/modules/metric/domain';

const TICK_MS = 2_000;

export const useLiveSamples = (count: number, isPlaying: boolean): Metric[] => {
    const isReduced = useReducedMotion();
    const [samples, setSamples] = useState(() => firstSamples(count));

    useEffect(() => {
        if(!isPlaying || isReduced) return;

        const timer = setInterval(() => setSamples(nextSamples), TICK_MS);
        return () => clearInterval(timer);
    }, [isPlaying, isReduced]);

    return samples;
};
