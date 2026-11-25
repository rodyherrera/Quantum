import type { ReactNode } from 'react';

interface PropertyGroupProps{
    title: string;
    children: ReactNode;
}

export const PropertyGroup = ({ title, children }: PropertyGroupProps) => (
    <section className='pt-4'>
        <h3 className='mb-1 text-xs font-medium text-subtle'>{title}</h3>
        <dl className='flex flex-col'>{children}</dl>
    </section>
);

interface PropertyProps{
    label: string;
    children: ReactNode;
}

const Property = ({ label, children }: PropertyProps) => (
    <div className='grid min-h-8 grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-2'>
        <dt className='text-subtle'>{label}</dt>
        <dd className='flex min-w-0 items-center gap-2 font-medium text-foreground'>{children}</dd>
    </div>
);

export default Property;
