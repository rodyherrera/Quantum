import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import GithubIcon from '@/shared/components/icons/GithubIcon';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { order } from '@/modules/home/utils/order';

const LandingClosing = () => (
    <section aria-labelledby='closing' className='lp-section lp-rule'>
        <div className='lp-wrap flex flex-col items-center text-center'>
            <h2 id='closing' className='lp-reveal text-[clamp(3rem,8.6vw,9.5rem)] font-light leading-[0.92] tracking-[-0.055em]'>
                Rent the server.
                <span className='block lp-dim'>Own the platform.</span>
            </h2>

            <div className='lp-reveal mt-[clamp(40px,4vw,64px)] flex flex-wrap justify-center gap-3' style={order(1)}>
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
    </section>
);

export default LandingClosing;
