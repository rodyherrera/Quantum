import { lazy } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import CommandBlock from '@/modules/home/components/CommandBlock';
import LandingSection from '@/modules/home/components/LandingSection';
import LandingDeferred from '@/modules/home/components/LandingDeferred';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { order } from '@/modules/home/utils/order';

const DeployTranscript = lazy(() => import('@/modules/home/components/DeployTranscript'));

const CONTAINERS = [
    { name: 'quantum-web', port: ':5050', role: 'The dashboard you are reading about.' },
    { name: 'quantum-api', port: ':7080', role: 'Talks to Docker and runs everything you deploy.' },
    { name: 'quantum-postgres', port: '127.0.0.1:5432', role: 'Remembers your apps, people and settings.' }
];

const FACTS = [
    {
        title: 'Your data stays on your disk.',
        body: 'Postgres keeps its data in the postgres_data volume, repositories live under /var/lib/quantum and everything else in Docker volumes.'
    },
    {
        title: 'Back on its own after a reboot.',
        body: 'Every five minutes Quantum compares what runs with what should, and starts whatever is missing.'
    }
];

const LandingSelfHost = () => (
    <LandingSection
        id='self-host'
        index='03'
        label='Self-host'
        title='Three containers.'
        subtitle='One command.'
    >
        <div className='grid gap-14 lg:grid-cols-12 lg:gap-6'>
            <div className='flex flex-col gap-12 lg:col-span-5 lg:pr-12'>
                <ul className='lp-reveal border-t border-[var(--lp-line)]'>
                    {CONTAINERS.map((container) => (
                        <li key={container.name} className='grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1.5 border-b border-[var(--lp-line)] py-5'>
                            <span className='font-mono text-[0.9375rem] text-white'>{container.name}</span>
                            <span className='lp-index self-center'>{container.port}</span>
                            <span className='lp-body col-span-2'>{container.role}</span>
                        </li>
                    ))}
                </ul>

                <dl className='lp-reveal grid gap-8 sm:grid-cols-2 lg:grid-cols-1' style={order(1)}>
                    {FACTS.map((fact) => (
                        <div key={fact.title}>
                            <dt className='text-[1.0625rem] tracking-[-0.01em] text-white'>{fact.title}</dt>
                            <dd className='lp-body mt-2'>{fact.body}</dd>
                        </div>
                    ))}
                </dl>

                <div className='lp-reveal flex flex-wrap items-center gap-x-8 gap-y-4' style={order(2)}>
                    <Link to='/get-started' className={buttonVariants({ size: 'lg' })}>
                        Follow the guide
                        <ArrowRight aria-hidden='true' className='size-4' />
                    </Link>

                    <a href={`${GITHUB_URL}#deploy-quantum`} target='_blank' rel='noreferrer' className='label-caps lp-link'>Read the README</a>
                </div>
            </div>

            <div className='flex min-w-0 flex-col gap-6 lg:col-span-7'>
                <div className='lp-reveal'>
                    <CommandBlock label='On a Linux machine with Docker' command={`git clone ${GITHUB_URL} && cd Quantum`} />
                </div>

                <LandingDeferred className='lp-reveal min-h-[40rem] sm:min-h-[38rem]'>
                    <DeployTranscript />
                </LandingDeferred>
            </div>
        </div>
    </LandingSection>
);

export default LandingSelfHost;
