import { cn } from '@heroui/react';
import { Check } from 'lucide-react';
import type { GuideStep } from '@/landing/utils/guide';

const LINK = 'flex items-center gap-2 rounded-md px-2 py-1.5 text-muted transition-colors hover:bg-default hover:text-foreground aria-[current=step]:bg-default aria-[current=step]:text-foreground motion-reduce:transition-none max-lg:px-1';

const MORE = [
    { hash: 'troubleshooting', label: 'If something goes wrong' },
    { hash: 'commands', label: 'Commands worth keeping' }
];

interface GuideRailProps{
    steps: GuideStep[];
    finished: number;
    current: string | null;
    isDone: (id: string) => boolean;
}

const GuideRail = ({ steps, finished, current, isDone }: GuideRailProps) => (
    <nav aria-label='Steps' className='grid gap-2'>
        <p className='flex items-baseline justify-between gap-4 px-2 text-xs text-subtle max-lg:px-1'>
            <span>Progress</span>
            <span className='tabular-nums'>{finished} of {steps.length} done</span>
        </p>

        <ol className='flex gap-0.5 overflow-x-auto [scrollbar-width:none] lg:grid'>
            {steps.map((step, index) => (
                <li key={step.id} className='shrink-0'>
                    <a href={`#step-${step.id}`} aria-current={step.id === current ? 'step' : undefined} className={LINK}>
                        <span
                            aria-hidden='true'
                            className={cn(
                                'grid size-5 shrink-0 place-items-center rounded-full border text-[0.6875rem] tabular-nums',
                                isDone(step.id) ? 'border-transparent bg-success/15 text-success' : 'border-border text-subtle'
                            )}
                        >
                            {isDone(step.id) ? <Check className='size-3' /> : index + 1}
                        </span>

                        <span className='min-w-0 truncate max-lg:sr-only'>
                            {step.title}
                            {isDone(step.id) && <span className='sr-only'>, done</span>}
                        </span>
                    </a>
                </li>
            ))}
        </ol>

        <ul className='mt-1 hidden border-t border-separator pt-3 lg:grid'>
            {MORE.map((link) => (
                <li key={link.hash}>
                    <a href={`#${link.hash}`} className={LINK}>{link.label}</a>
                </li>
            ))}
        </ul>
    </nav>
);

export default GuideRail;
