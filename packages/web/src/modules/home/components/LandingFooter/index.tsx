import { Link } from 'react-router-dom';
import { GITHUB_URL, ISSUES_URL, LICENSE_URL, SUPPORT_URL } from '@/modules/home/utils/links';
import { order } from '@/modules/home/utils/order';
import type { To } from 'react-router-dom';

type FooterLink =
    | { label: string; to: To }
    | { label: string; href: string };

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
    {
        heading: 'Product',
        links: [
            { label: 'Deploy', to: { pathname: '/', hash: 'deploy' } },
            { label: 'Operate', to: { pathname: '/', hash: 'operate' } },
            { label: 'Self-host', to: { pathname: '/', hash: 'self-host' } }
        ]
    },
    {
        heading: 'Guide',
        links: [
            { label: 'Get started', to: '/get-started' },
            { label: 'What you need', to: { pathname: '/get-started', hash: 'requirements' } },
            { label: 'Troubleshooting', to: { pathname: '/get-started', hash: 'troubleshooting' } }
        ]
    },
    {
        heading: 'Project',
        links: [
            { label: 'GitHub', href: GITHUB_URL },
            { label: 'Issues', href: ISSUES_URL },
            { label: 'MIT License', href: LICENSE_URL },
            { label: 'Buy me a coffee', href: SUPPORT_URL }
        ]
    }
];

const WORDMARK = [...'QUANTUM'];

const LandingFooter = () => (
    <footer className='lp-rule @container overflow-hidden'>
        <div className='lp-wrap grid gap-14 pb-14 pt-[clamp(56px,6vw,96px)] md:grid-cols-12 md:gap-6'>
            <div className='flex flex-col gap-4 md:col-span-5'>
                <Link to='/' className='wordmark w-fit text-white'>Quantum</Link>
                <p className='lp-body max-w-[36ch]'>A self-hosted platform for your repositories, databases, templates and Compose stacks.</p>
            </div>

            <nav aria-label='Footer' className='grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7'>
                {COLUMNS.map((column) => (
                    <div key={column.heading} className='flex flex-col gap-3.5'>
                        <p className='label-caps lp-faint mb-1'>{column.heading}</p>

                        {column.links.map((link) => 'href' in link ? (
                            <a key={link.label} href={link.href} target='_blank' rel='noreferrer' className='lp-link w-fit text-[0.9375rem]'>{link.label}</a>
                        ) : (
                            <Link key={link.label} to={link.to} className='lp-link w-fit text-[0.9375rem]'>{link.label}</Link>
                        ))}
                    </div>
                ))}
            </nav>
        </div>

        <div className='lp-wrap flex flex-wrap items-center justify-between gap-4 border-t border-[var(--lp-line)] py-6'>
            <span className='label-caps lp-faint'>© {new Date().getFullYear()} Quantum · MIT License</span>
            <span className='label-caps lp-faint'>Self-hosted · Open source</span>
        </div>

        <div aria-hidden='true' className='lp-wordmark lp-reveal px-[var(--lp-gutter)] pb-[clamp(16px,2vw,32px)] pt-6'>
            {WORDMARK.map((letter, index) => <span key={index} style={order(index)}>{letter}</span>)}
        </div>
    </footer>
);

export default LandingFooter;
