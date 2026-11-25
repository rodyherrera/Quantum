import { Link, NavLink } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import QuantumMark from '@/modules/home/components/QuantumMark';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { WRAP } from '@/modules/home/utils/classes';

const LINK = 'transition-colors hover:text-foreground aria-[current=page]:text-foreground motion-reduce:transition-none';

const LandingNav = () => (
    <header className='sticky top-0 z-30 border-b border-separator bg-background/80 backdrop-blur-md'>
        <div className={`${WRAP} flex h-15 items-center gap-6`}>
            <Link to='/' className='inline-flex items-center gap-2 text-sm font-semibold tracking-[-0.01em] text-foreground'>
                <QuantumMark className='size-5.5' />
                Quantum
            </Link>

            <nav aria-label='Sections' className='hidden items-center gap-5 text-muted md:flex'>
                <Link to={{ pathname: '/', hash: 'deploy' }} className={LINK}>Deploy</Link>
                <Link to={{ pathname: '/', hash: 'operate' }} className={LINK}>Operate</Link>
                <NavLink to='/get-started' className={LINK}>Self-host guide</NavLink>
                <a href={GITHUB_URL} target='_blank' rel='noreferrer' className={LINK}>GitHub</a>
            </nav>

            <div className='ms-auto flex items-center gap-1.5'>
                <Link to='/sign-in' className={buttonVariants({ size: 'sm', variant: 'ghost' })}>Log in</Link>
                <Link to='/sign-up' className={buttonVariants({ size: 'sm' })}>Sign up</Link>
            </div>
        </div>
    </header>
);

export default LandingNav;
