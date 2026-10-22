import { order } from '@/modules/home/utils/order';
import type { ReactNode } from 'react';

interface LandingSectionProps{
    id: string;
    index: string;
    label: string;
    title: string;
    subtitle: string;
    lead?: ReactNode;
    children: ReactNode;
}

const LandingSection = ({ id, index, label, title, subtitle, lead, children }: LandingSectionProps) => (
    <section id={id} aria-labelledby={`${id}-title`} className='lp-section lp-rule'>
        <div className='lp-wrap'>
            <header className='grid gap-8 lg:grid-cols-12 lg:gap-6'>
                <p className='lp-reveal flex items-center gap-4 self-start lg:col-span-3 lg:pt-4'>
                    <span className='lp-index'>{index}</span>
                    <span className='label-caps lp-dim'>{label}</span>
                </p>

                <div className='lg:col-span-9'>
                    <h2 id={`${id}-title`} className='lp-heading lp-reveal' style={order(1)}>
                        {title}
                        <span className='block lp-dim'>{subtitle}</span>
                    </h2>

                    {lead !== undefined && <p className='lp-lead lp-reveal mt-8 max-w-[50ch]' style={order(2)}>{lead}</p>}
                </div>
            </header>

            <div className='mt-[clamp(56px,6.4vw,112px)]'>{children}</div>
        </div>
    </section>
);

export default LandingSection;
