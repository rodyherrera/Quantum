import { Plus } from 'lucide-react';
import CommandBlock from '@/modules/home/components/CommandBlock';
import GuideText from '@/modules/home/components/GuideText';
import type { Trouble } from '@/modules/home/utils/guide';

interface GuideTroublesProps{
    troubles: Trouble[];
}

const GuideTroubles = ({ troubles }: GuideTroublesProps) => (
    <ul className='lp-rule'>
        {troubles.map((trouble) => (
            <li key={trouble.id} className='border-b border-[var(--lp-line)]'>
                <details className='lp-trouble'>
                    <summary>
                        <span>{trouble.problem}</span>
                        <Plus aria-hidden='true' className='lp-trouble__icon size-4 shrink-0' />
                    </summary>

                    <div className='flex flex-col gap-5 pb-8'>
                        <p className='lp-body max-w-[64ch]'><GuideText text={trouble.fix} /></p>
                        {trouble.commands.map((command) => <CommandBlock key={command} command={command} />)}
                    </div>
                </details>
            </li>
        ))}
    </ul>
);

export default GuideTroubles;
