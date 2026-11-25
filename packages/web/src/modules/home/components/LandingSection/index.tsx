import SectionHeading from '@/modules/home/components/SectionHeading';
import { WRAP } from '@/modules/home/utils/classes';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface LandingSectionProps{
    id: string;
    icon: LucideIcon;
    label: string;
    title: string;
    lead: ReactNode;
    children: ReactNode;
}

const LandingSection = ({ id, icon, label, title, lead, children }: LandingSectionProps) => (
    <section id={id} aria-labelledby={`${id}-title`} className='pt-[clamp(4.5rem,10vw,7rem)]'>
        <div className={`${WRAP} grid grid-cols-1 gap-10`}>
            <SectionHeading id={`${id}-title`} icon={icon} label={label} title={title} lead={lead} />
            {children}
        </div>
    </section>
);

export default LandingSection;
