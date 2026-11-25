import type { ReactNode } from 'react';

interface GuideSectionProps{
    id: string;
    title: string;
    lead?: ReactNode;
    children: ReactNode;
}

const GuideSection = ({ id, title, lead, children }: GuideSectionProps) => (
    <section id={id} aria-labelledby={`${id}-title`} className='grid min-w-0 scroll-mt-24 grid-cols-1 gap-4'>
        <header className='grid gap-2'>
            <h2 id={`${id}-title`} className='text-xl font-semibold tracking-[-0.02em]'>{title}</h2>
            {lead !== undefined && <p className='max-w-[64ch] leading-[1.6] text-muted'>{lead}</p>}
        </header>

        {children}
    </section>
);

export default GuideSection;
