import { Link, NavLink } from 'react-router-dom';
import { cn } from '@heroui/react';
import PixelLink from '@/landing/components/PixelLink';
import { DASHBOARD_URL, GITHUB_URL } from '@/landing/utils/links';
import { WRAP } from '@/landing/utils/classes';

interface LandingNavProps{
    overlay?: boolean;
}

/* overlay floats the bar over the hero's blue field; otherwise it sticks to the top of the page. */
const LandingNav = ({ overlay = false }: LandingNavProps) => {
    const link = cn(
        'transition-colors motion-reduce:transition-none',
        overlay ? 'text-white/70 hover:text-white aria-[current=page]:text-white' : 'text-muted hover:text-foreground aria-[current=page]:text-foreground'
    );

    return (
        <header className={overlay ? 'absolute inset-x-0 top-3 z-30 text-white' : 'sticky top-0 z-30 border-b border-separator bg-background/85 backdrop-blur-md'}>
            <div className={cn('flex h-15 items-center gap-7', overlay ? 'mx-auto w-full max-w-[70rem] px-7' : WRAP)}>
                <Link to='/' className='text-sm font-semibold tracking-[-0.01em]'>Quantum</Link>

                <nav aria-label='Sections' className='hidden items-center gap-6 md:flex'>
                    <Link to={{ pathname: '/', hash: 'deploy' }} className={link}>Deploy</Link>
                    <Link to={{ pathname: '/', hash: 'operate' }} className={link}>Operate</Link>
                    <NavLink to='/get-started' className={link}>Guide</NavLink>
                    <a href={GITHUB_URL} target='_blank' rel='noreferrer' className={link}>GitHub</a>
                </nav>

                <div className='ms-auto flex items-center gap-5'>
                    <a href={`${DASHBOARD_URL}/sign-in`} className={link}>Log in</a>
                    <PixelLink href={`${DASHBOARD_URL}/sign-up`} newTab={false} size='sm' tone={overlay ? 'paper' : 'theme'}>Sign up</PixelLink>
                </div>
            </div>
        </header>
    );
};

export default LandingNav;
