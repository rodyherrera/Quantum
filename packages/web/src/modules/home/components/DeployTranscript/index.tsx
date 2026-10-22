import { useEffect, useRef, useState } from 'react';
import LandingWindow from '@/modules/home/components/LandingWindow';
import { useInView } from '@/modules/home/hooks/use-in-view';
import { useReducedMotion } from '@/modules/home/hooks/use-reduced-motion';
import { DEPLOY_TRANSCRIPT } from '@/modules/home/utils/demo/terminal';
import type { TranscriptLine, TranscriptTone } from '@/modules/home/utils/demo/terminal';

const DELAY_MS: Record<TranscriptTone, number> = {
    command: 900,
    heading: 560,
    output: 120,
    warning: 220,
    success: 900
};

const TONE: Record<TranscriptTone, string> = {
    command: 'text-white',
    heading: 'mt-4 font-medium text-white first:mt-0',
    output: 'lp-dim',
    warning: 'text-warning',
    success: 'mt-4 font-medium text-[var(--lp-ok)]'
};

const Row = ({ line }: { line: TranscriptLine }) => (
    <span className={`block ${TONE[line.tone]}`}>
        {line.tone === 'command' && <span className='lp-faint select-none'>~/Quantum $ </span>}
        {line.text}
    </span>
);

const DeployTranscript = () => {
    const frame = useRef<HTMLDivElement>(null);
    const hasStarted = useInView(frame, { margin: '-20% 0px', once: true });
    const isReduced = useReducedMotion();
    const [count, setCount] = useState(0);
    const shown = isReduced ? DEPLOY_TRANSCRIPT.length : count;
    const next = DEPLOY_TRANSCRIPT[shown];

    useEffect(() => {
        if(!hasStarted || isReduced || next === undefined) return;

        const timer = setTimeout(() => setCount((current) => current + 1), DELAY_MS[next.tone]);
        return () => clearTimeout(timer);
    }, [hasStarted, isReduced, next]);

    return (
        <div ref={frame}>
            <LandingWindow title='bash · ~/Quantum'>
                <pre aria-label='Output of bash scripts/deploy.sh' className='lp-terminal h-[40rem] overflow-x-auto whitespace-pre px-5 py-5 sm:h-[38rem]'>
                    {DEPLOY_TRANSCRIPT.slice(0, shown).map((line, index) => <Row key={index} line={line} />)}
                    {next !== undefined && <span aria-hidden='true' className='lp-caret block lp-dim' />}
                </pre>
            </LandingWindow>
        </div>
    );
};

export default DeployTranscript;
