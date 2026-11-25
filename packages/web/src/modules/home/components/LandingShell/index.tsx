import { ScrollRestoration } from 'react-router-dom';
import LandingNav from '@/modules/home/components/LandingNav';
import LandingFooter from '@/modules/home/components/LandingFooter';
import type { ReactNode } from 'react';

interface LandingShellProps{
    overlay?: boolean;
    children: ReactNode;
}

const LandingShell = ({ overlay = false, children }: LandingShellProps) => (
    <div className='relative flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground'>
        <ScrollRestoration />
        <LandingNav overlay={overlay} />
        <main className='flex-1'>{children}</main>
        <LandingFooter />
    </div>
);

export default LandingShell;
