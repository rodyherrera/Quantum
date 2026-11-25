import { buttonVariants, Chip, cn } from '@heroui/react';
import { ArrowUpRight, Check, Info } from 'lucide-react';
import CommandBlock from '@/modules/home/components/CommandBlock';
import CopyButton from '@/modules/home/components/CopyButton';
import GuideText from '@/modules/home/components/GuideText';
import { CARD, CARD_LABEL } from '@/modules/home/utils/classes';
import type { GuideBlock, GuideStep } from '@/modules/home/utils/guide';

interface BlockProps{
    block: GuideBlock;
}

const Block = ({ block }: BlockProps) => {
    switch(block.kind){
        case 'command':
            return <CommandBlock command={block.code} label={block.label} />;
        case 'fields':
            return (
                <figure className={`${CARD} m-0`}>
                    {block.label !== undefined && <figcaption className={`${CARD_LABEL} py-2 pr-3`}>{block.label}</figcaption>}

                    <dl className='m-0'>
                        {block.fields.map((field) => (
                            <div key={field.label} className='grid items-center gap-x-6 border-t border-separator pl-3 pr-1 first:border-t-0 sm:grid-cols-[13rem_minmax(0,1fr)]'>
                                <dt className='pt-2 text-muted sm:pt-0'>{field.label}</dt>
                                <dd className='m-0 flex min-w-0 items-center justify-between gap-2 py-1'>
                                    <code className='min-w-0 break-all font-mono text-xs text-foreground'>{field.value}</code>
                                    <CopyButton value={field.value} label={`Copy ${field.label}`} />
                                </dd>
                            </div>
                        ))}
                    </dl>
                </figure>
            );
        case 'expect':
            return (
                <figure className={`${CARD} m-0`}>
                    <figcaption className={`${CARD_LABEL} py-2 pr-3`}>You should see something like</figcaption>
                    <pre className='m-0 overflow-x-auto px-3.5 py-2.5 font-mono text-xs leading-[1.7] text-muted'>{block.lines.join('\n')}</pre>
                </figure>
            );
        case 'link':
            return (
                <a href={block.href} target='_blank' rel='noreferrer' className={cn(buttonVariants({ variant: 'secondary' }), 'w-fit')}>
                    {block.label}
                    <ArrowUpRight aria-hidden='true' />
                </a>
            );
        case 'note':
            return (
                <p className='flex gap-2.5 rounded-lg border border-separator bg-surface-secondary px-3 py-2.5 leading-[1.55] text-muted'>
                    <Info aria-hidden='true' className='mt-0.5 size-3.5 shrink-0 text-subtle' />
                    <span className='min-w-0'><GuideText text={block.text} /></span>
                </p>
            );
    }
};

interface GuideStepItemProps{
    step: GuideStep;
    number: number;
    isDone: boolean;
    onToggle: () => void;
}

const GuideStepItem = ({ step, number, isDone, onToggle }: GuideStepItemProps) => (
    <li id={`step-${step.id}`} data-step={step.id} className='grid min-w-0 scroll-mt-24 grid-cols-1 gap-3'>
        <h2 className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-semibold tracking-[-0.02em]'>
            <span aria-hidden='true' className={cn('inline-flex min-w-5 text-sm font-medium tabular-nums', isDone ? 'text-success' : 'text-subtle')}>
                {isDone ? <Check className='size-4' /> : String(number).padStart(2, '0')}
            </span>
            {step.title}
            {step.isOptional && <Chip>Optional</Chip>}
        </h2>

        <p className='max-w-[64ch] leading-[1.6] text-muted'><GuideText text={step.summary} /></p>

        {step.blocks.map((block, index) => <Block key={`${block.kind}-${index}`} block={block} />)}

        <label className='mt-1 inline-flex w-fit cursor-pointer select-none items-center gap-2 text-muted transition-colors hover:text-foreground has-checked:text-foreground motion-reduce:transition-none'>
            <input type='checkbox' checked={isDone} onChange={onToggle} className='peer sr-only' />
            <span
                aria-hidden='true'
                className='grid size-4 place-items-center rounded-[0.25rem] border border-border text-transparent transition-colors peer-checked:border-transparent peer-checked:bg-success peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent motion-reduce:transition-none'
            >
                <Check className='size-3' />
            </span>
            Done
        </label>
    </li>
);

export default GuideStepItem;
