import { cn } from '@heroui/react';
import Crosshair from '@/modules/home/components/Crosshair';
import { RULED } from '@/modules/home/utils/classes';
import type { ReactNode } from 'react';

interface BandProps{
    id?: string;
    labelledBy?: string;
    label?: string;
    className?: string;
    children: ReactNode;
}

/* One stretch of the landing's column: a rule across the page and a + where it meets each side. */
const Band = ({ id, labelledBy, label, className, children }: BandProps) => (
    <section id={id} aria-labelledby={labelledBy} aria-label={label} className='scroll-mt-4 border-t border-separator px-4 sm:px-6'>
        <div className={cn(RULED, className)}>
            <Crosshair className='-left-px -top-px text-subtle' />
            <Crosshair className='-top-px right-0 translate-x-px text-subtle' />
            {children}
        </div>
    </section>
);

export default Band;
