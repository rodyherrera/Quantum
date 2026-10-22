import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import { useScrolled } from '@/modules/home/hooks/use-scrolled';
import { GITHUB_URL } from '@/modules/home/utils/links';

const SECTIONS = [
    { hash: 'deploy', label: 'Deploy' },
    { hash: 'operate', label: 'Operate' },
    { hash: 'self-host', label: 'Self-host' }
];

const LandingNav = () => {
    const header = useRef<HTMLElement>(null);
    useScrolled(header);

    return (
        <header ref={header} className='lp-header sticky top-0 z-50'>
            <div className='lp-wrap flex h-16 items-center gap-10'>
                <Link to='/' className='wordmark text-white'>Quantum</Link>

                <nav aria-label='Sections' className='hidden items-center gap-8 md:flex'>
                    {SECTIONS.map((section) => (
                        <Link key={section.hash} to={{ pathname: '/', hash: section.hash }} className='label-caps lp-link'>
                            {section.label}
                        </Link>
                    ))}

                    <a href={GITHUB_URL} target='_blank' rel='noreferrer' className='label-caps lp-link'>GitHub</a>
                </nav>

                <div className='ms-auto flex items-center gap-6'>
                    <Link to='/sign-in' className='label-caps lp-link hidden sm:inline'>Sign in</Link>

                    <Link to='/get-started' className={buttonVariants({ size: 'sm' })}>
                        Get started
                        <ArrowRight aria-hidden='true' className='size-3.5' />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default LandingNav;
