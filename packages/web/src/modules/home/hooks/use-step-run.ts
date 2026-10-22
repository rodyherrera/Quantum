import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/modules/home/hooks/use-reduced-motion';
import { runAt } from '@/modules/home/utils/demo/activity';
import type { RunScript } from '@/modules/home/utils/demo/activity';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const HOLD_MS = 5_200;

const INSTANT_MS = 280;

const stepDelay = (durationMs: number | null): number =>
    durationMs === null ? INSTANT_MS : Math.min(2_600, 560 + Math.sqrt(durationMs) * 8);

export interface StepRun{
    steps: ActivityEvent[];
    done: boolean;
}

export const useStepRun = (script: RunScript, isPlaying: boolean): StepRun => {
    const isReduced = useReducedMotion();
    const [position, setPosition] = useState(0);
    const total = script.steps.length;
    const shown = isReduced ? total : position;

    useEffect(() => {
        if(isPlaying) setPosition(0);
    }, [isPlaying]);

    useEffect(() => {
        if(!isPlaying || isReduced) return;

        const delay = position < total ? stepDelay(script.steps[position]?.durationMs ?? null) : HOLD_MS;
        const timer = setTimeout(() => setPosition((current) => (current < total ? current + 1 : 0)), delay);
        return () => clearTimeout(timer);
    }, [isPlaying, isReduced, position, script, total]);

    return { steps: runAt(script, shown), done: shown >= total };
};
