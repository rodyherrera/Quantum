import '@/modules/home/components/Landing/landing.css';
import { ScrollRestoration } from 'react-router-dom';
import LandingNav from '@/modules/home/components/LandingNav';
import LandingFooter from '@/modules/home/components/LandingFooter';
import { useReveal } from '@/modules/home/hooks/use-reveal';
import type { ReactNode } from 'react';

interface LandingShellProps{
    children: ReactNode;
}

const LandingShell = ({ children }: LandingShellProps) => {
    const root = useReveal<HTMLDivElement>();

    return (
        <div ref={root} className='landing dark font-sans'>
            <ScrollRestoration />
            <LandingNav />
            <main>{children}</main>
            <LandingFooter />
        </div>
    );
};

export default LandingShell;
