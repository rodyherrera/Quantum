import { Check } from 'lucide-react';
import type { GuideStep } from '@/modules/home/utils/guide';

interface GuideRailProps{
    steps: GuideStep[];
    finished: number;
    current: string | null;
    isDone: (id: string) => boolean;
}

const GuideRail = ({ steps, finished, current, isDone }: GuideRailProps) => (
    <nav aria-label='Steps' className='lp-rail'>
        <p className='flex items-baseline justify-between gap-4'>
            <span className='label-caps lp-dim'>Progress</span>
            <span className='lp-index'>{finished} / {steps.length}</span>
        </p>

        <div aria-hidden='true' className='lp-meter mt-3'>
            <span style={{ transform: `scaleX(${finished / steps.length})` }} />
        </div>

        <ol className='mt-6 flex flex-col'>
            {steps.map((step, index) => (
                <li key={step.id}>
                    <a
                        href={`#step-${step.id}`}
                        aria-current={step.id === current ? 'step' : undefined}
                        data-done={isDone(step.id)}
                    >
                        <span aria-hidden='true' className='lp-index flex w-6 shrink-0'>
                            {isDone(step.id) ? <Check className='size-3.5' /> : String(index + 1).padStart(2, '0')}
                        </span>
                        {step.title}
                    </a>
                </li>
            ))}
        </ol>
    </nav>
);

export default GuideRail;
