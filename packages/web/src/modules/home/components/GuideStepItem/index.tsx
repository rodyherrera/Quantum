import { buttonVariants } from '@heroui/react';
import { ArrowUpRight, Check } from 'lucide-react';
import CommandBlock from '@/modules/home/components/CommandBlock';
import CopyButton from '@/modules/home/components/CopyButton';
import GuideText from '@/modules/home/components/GuideText';
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
                <figure className='flex min-w-0 flex-col gap-2'>
                    {block.label !== undefined && <figcaption className='label-caps lp-dim'>{block.label}</figcaption>}

                    <dl className='lp-fields'>
                        {block.fields.map((field) => (
                            <div key={field.label} className='grid items-center gap-x-6 pl-4 sm:grid-cols-[13rem_minmax(0,1fr)]'>
                                <dt className='pt-3 text-[0.8125rem] lp-dim sm:pt-0'>{field.label}</dt>
                                <dd className='flex min-w-0 items-center justify-between gap-2'>
                                    <code className='min-w-0 break-all font-mono text-[0.8125rem] text-white'>{field.value}</code>
                                    <CopyButton value={field.value} label={`Copy ${field.label}`} />
                                </dd>
                            </div>
                        ))}
                    </dl>
                </figure>
            );
        case 'expect':
            return (
                <figure className='flex min-w-0 flex-col gap-2'>
                    <figcaption className='label-caps lp-dim'>You should see something like</figcaption>
                    <pre className='lp-expect'>{block.lines.join('\n')}</pre>
                </figure>
            );
        case 'link':
            return (
                <a href={block.href} target='_blank' rel='noreferrer' className={`${buttonVariants({ variant: 'secondary' })} self-start`}>
                    {block.label}
                    <ArrowUpRight aria-hidden='true' className='size-4' />
                </a>
            );
        case 'note':
            return <p className='lp-body max-w-[64ch]'><GuideText text={block.text} /></p>;
    }
};

interface GuideStepItemProps{
    step: GuideStep;
    number: number;
    isDone: boolean;
    onToggle: () => void;
}

const GuideStepItem = ({ step, number, isDone, onToggle }: GuideStepItemProps) => (
    <li id={`step-${step.id}`} data-step={step.id} data-done={isDone} className='lp-step'>
        <span aria-hidden='true' className='lp-step__number'>
            {isDone ? <Check className='size-4' /> : String(number).padStart(2, '0')}
        </span>

        <div className='flex min-w-0 flex-col gap-6'>
            <header className='flex flex-col gap-3'>
                <h3 className='lp-title flex flex-wrap items-baseline gap-x-4 gap-y-1'>
                    {step.title}
                    {step.isOptional && <span className='label-caps lp-faint'>Optional</span>}
                </h3>

                <p className='lp-body max-w-[64ch]'><GuideText text={step.summary} /></p>
            </header>

            {step.blocks.map((block, index) => <Block key={`${block.kind}-${index}`} block={block} />)}

            <label className='lp-check'>
                <input type='checkbox' checked={isDone} onChange={onToggle} className='sr-only' />
                <span aria-hidden='true' className='lp-mark'>
                    <Check className='size-3' />
                </span>
                Done
            </label>
        </div>
    </li>
);

export default GuideStepItem;
