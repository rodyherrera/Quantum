import { Link } from 'react-router-dom';
import QuantumMark from '@/modules/home/components/QuantumMark';
import { GITHUB_URL, ISSUES_URL, LICENSE_URL, SUPPORT_URL } from '@/modules/home/utils/links';
import { WRAP } from '@/modules/home/utils/classes';

const LINK = 'transition-colors hover:text-foreground motion-reduce:transition-none';

const EXTERNAL = [
    { label: 'GitHub', href: GITHUB_URL },
    { label: 'Issues', href: ISSUES_URL },
    { label: 'Buy me a coffee', href: SUPPORT_URL }
];

const LandingFooter = () => (
    <footer className='mt-15 border-t border-separator'>
        <div className={`${WRAP} flex min-h-16 flex-wrap items-center gap-x-5 gap-y-2 py-4 text-xs text-subtle`}>
            <Link to='/' className='inline-flex items-center gap-2 font-semibold text-foreground'>
                <QuantumMark className='size-4' />
                Quantum
            </Link>

            <a href={LICENSE_URL} target='_blank' rel='noreferrer' className={LINK}>MIT License</a>

            <nav aria-label='Footer' className='flex flex-wrap items-center gap-x-5 gap-y-2 sm:ms-auto'>
                <Link to='/get-started' className={LINK}>Self-host guide</Link>
                <Link to={{ pathname: '/get-started', hash: 'troubleshooting' }} className={LINK}>Troubleshooting</Link>

                {EXTERNAL.map((link) => (
                    <a key={link.href} href={link.href} target='_blank' rel='noreferrer' className={LINK}>{link.label}</a>
                ))}
            </nav>
        </div>
    </footer>
);

export default LandingFooter;
