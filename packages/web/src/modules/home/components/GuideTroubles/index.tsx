import { Plus } from 'lucide-react';
import CommandBlock from '@/modules/home/components/CommandBlock';
import GuideText from '@/modules/home/components/GuideText';
import { CARD } from '@/modules/home/utils/classes';
import type { Trouble } from '@/modules/home/utils/guide';

interface GuideTroublesProps{
    troubles: Trouble[];
}

const GuideTroubles = ({ troubles }: GuideTroublesProps) => (
    <ul className={CARD}>
        {troubles.map((trouble) => (
            <li key={trouble.id} className='border-t border-separator first:border-t-0'>
                <details className='group'>
                    <summary className='flex cursor-pointer list-none items-center justify-between gap-6 px-4 py-3 font-medium text-foreground transition-colors hover:bg-default focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none [&::-webkit-details-marker]:hidden'>
                        <span>{trouble.problem}</span>
                        <Plus aria-hidden='true' className='size-3.5 shrink-0 text-subtle transition-transform group-open:rotate-45 motion-reduce:transition-none' />
                    </summary>

                    <div className='grid gap-3 px-4 pb-4 pt-1'>
                        <p className='max-w-[64ch] leading-[1.6] text-muted'><GuideText text={trouble.fix} /></p>
                        {trouble.commands.map((command) => <CommandBlock key={command} command={command} />)}
                    </div>
                </details>
            </li>
        ))}
    </ul>
);

export default GuideTroubles;
