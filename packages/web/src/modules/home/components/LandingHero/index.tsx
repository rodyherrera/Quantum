import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import LandingWindow from '@/modules/home/components/LandingWindow';
import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingDashboard from '@/modules/home/components/LandingDashboard';
import LandingWords from '@/modules/home/components/LandingWords';
import { GITHUB_URL } from '@/modules/home/utils/links';

const FIRST_LINE = 'Deploy anything.';

const SECOND_LINE = 'On a server you own.';

const LandingHero = () => (
    <section className='relative pt-[clamp(64px,10vw,168px)]'>
        <div className='lp-wrap'>
            <h1 className='lp-display'>
                <span className='block'><LandingWords text={FIRST_LINE} from={0} /></span>
                <span className='block lp-dim'><LandingWords text={SECOND_LINE} from={2} /></span>
            </h1>

            <div className='lp-enter mt-[clamp(40px,4.4vw,72px)] flex flex-wrap items-center gap-3'>
                <Link to='/get-started' className={buttonVariants({ size: 'lg' })}>
                    Get started
                    <ArrowRight aria-hidden='true' className='size-4' />
                </Link>

                <a href={GITHUB_URL} target='_blank' rel='noreferrer' className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
                    <GithubIcon className='size-4' />
                    View on GitHub
                </a>
            </div>
        </div>

        <div className='lp-wrap relative mt-[clamp(64px,8vw,136px)]'>
            <div aria-hidden='true' className='lp-glow' />

            <LandingWindow title='Quantum · Applications' className='lp-aperture max-md:w-[175vw]'>
                <LandingSheet title='The Applications page of a Quantum dashboard' width={1440} height={860} path='/applications'>
                    <LandingDashboard />
                </LandingSheet>
            </LandingWindow>
        </div>
    </section>
);

export default LandingHero;
