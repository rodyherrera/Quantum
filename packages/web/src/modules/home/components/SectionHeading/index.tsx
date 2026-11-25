import { ACCENT_TEXT } from '@/modules/home/utils/classes';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeadingProps{
    id: string;
    icon: LucideIcon;
    label: string;
    title: string;
    lead: ReactNode;
}

const SectionHeading = ({ id, icon: Icon, label, title, lead }: SectionHeadingProps) => (
    <header className='grid max-w-[47.5rem] gap-3'>
        <p className={`inline-flex items-center gap-2 font-medium ${ACCENT_TEXT}`}>
            <Icon aria-hidden='true' className='size-4' />
            {label}
        </p>

        <h2 id={id} className='text-[length:clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.035em]'>{title}</h2>

        <p className='max-w-[60ch] text-[0.9375rem] leading-[1.55] text-muted'>{lead}</p>
    </header>
);

export default SectionHeading;
