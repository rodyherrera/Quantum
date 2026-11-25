import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight, Server } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import SectionHeading from '@/modules/home/components/SectionHeading';
import CommandBlock from '@/modules/home/components/CommandBlock';
import GuideText from '@/modules/home/components/GuideText';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { WRAP } from '@/modules/home/utils/classes';

const COMMANDS = [`git clone ${GITHUB_URL}`, 'cd Quantum', 'bash scripts/deploy.sh'];

const LandingSelfHost = () => (
    <section id='self-host' aria-labelledby='self-host-title' className='pt-[clamp(5rem,10vw,7.5rem)]'>
        <div className={WRAP}>
            <div className='grid grid-cols-1 gap-4.5 rounded-[0.875rem] border border-separator bg-surface bg-[radial-gradient(80%_120%_at_100%_0%,var(--glow),transparent_60%)] px-5 py-6.5 sm:p-10'>
                <SectionHeading
                    id='self-host-title'
                    icon={Server}
                    label='Self-host'
                    title='Three containers and a .env file.'
                    lead={<GuideText text='The deploy script writes `.env` from `.env.example`, generates the secrets, builds the images and starts quantum-api, quantum-web and quantum-postgres. The dashboard answers on port 5050 and the API on 7080.' />}
                />

                <CommandBlock label='On a Linux machine with Docker' command={COMMANDS} />

                <div className='flex flex-wrap gap-2'>
                    <Link to='/get-started' className={buttonVariants({ size: 'lg' })}>
                        Open the guide
                        <ArrowRight aria-hidden='true' />
                    </Link>

                    <a href={`${GITHUB_URL}#deploy-quantum`} target='_blank' rel='noreferrer' className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
                        <GithubIcon className='size-3.5' />
                        Read the README
                    </a>
                </div>
            </div>
        </div>
    </section>
);

export default LandingSelfHost;
