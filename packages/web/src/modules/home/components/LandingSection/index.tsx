import Band from '@/modules/home/components/Band';
import SectionHeading from '@/modules/home/components/SectionHeading';
import type { ReactNode } from 'react';

interface LandingSectionProps{
    id: string;
    index: string;
    label: string;
    title: string;
    lead: ReactNode;
    children: ReactNode;
}

const LandingSection = ({ id, index, label, title, lead, children }: LandingSectionProps) => (
    <Band id={id} labelledBy={`${id}-title`}>
        <SectionHeading id={`${id}-title`} index={index} label={label} title={title} lead={lead} className='px-5 pb-12 pt-14 sm:px-9 sm:pb-14 sm:pt-18' />
        {children}
    </Band>
);

export default LandingSection;
