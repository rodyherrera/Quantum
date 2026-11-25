import { ScrollRestoration } from 'react-router-dom';
import LandingNav from '@/modules/home/components/LandingNav';
import LandingFooter from '@/modules/home/components/LandingFooter';
import type { ReactNode } from 'react';

interface LandingShellProps{
    children: ReactNode;
}

const LandingShell = ({ children }: LandingShellProps) => (
    <div className='flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground'>
        <ScrollRestoration />
        <LandingNav />
        <main className='flex-1'>{children}</main>
        <LandingFooter />
    </div>
);

export default LandingShell;
