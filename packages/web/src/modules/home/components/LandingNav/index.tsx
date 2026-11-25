import { Link, NavLink } from 'react-router-dom';
import { cn } from '@heroui/react';
import QuantumMark from '@/shared/components/QuantumMark';
import PixelLink from '@/modules/home/components/PixelLink';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { MONO_LABEL, WRAP } from '@/modules/home/utils/classes';

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
                <Link to='/' className='inline-flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]'>
                    <QuantumMark className='size-5.5' />
                    Quantum
                </Link>

                <nav aria-label='Sections' className={`${MONO_LABEL} hidden items-center gap-6 md:flex`}>
                    <Link to={{ pathname: '/', hash: 'deploy' }} className={link}>Deploy</Link>
                    <Link to={{ pathname: '/', hash: 'operate' }} className={link}>Operate</Link>
                    <NavLink to='/get-started' className={link}>Guide</NavLink>
                    <a href={GITHUB_URL} target='_blank' rel='noreferrer' className={link}>GitHub</a>
                </nav>

                <div className='ms-auto flex items-center gap-5'>
                    <Link to='/sign-in' className={`${MONO_LABEL} ${link}`}>Log in</Link>
                    <PixelLink to='/sign-up' size='sm' tone={overlay ? 'paper' : 'theme'}>Sign up</PixelLink>
                </div>
            </div>
        </header>
    );
};

export default LandingNav;
