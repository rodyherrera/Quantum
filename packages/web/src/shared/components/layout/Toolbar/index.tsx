import type { ReactNode } from 'react';

/* The filter row under the page bar. */
const Toolbar = ({ children }: { children: ReactNode }) => (
    <div className='flex min-h-10 shrink-0 flex-wrap items-center gap-2 border-b border-separator px-4 py-1.5'>{children}</div>
);

export default Toolbar;
