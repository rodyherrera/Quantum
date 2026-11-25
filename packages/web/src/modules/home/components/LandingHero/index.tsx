import { Link } from 'react-router-dom';
import { buttonVariants } from '@heroui/react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import CommandChip from '@/modules/home/components/CommandChip';
import LandingShot from '@/modules/home/components/LandingShot';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { ACCENT_TEXT, EYEBROW, GRADIENT_TITLE, LEDE, WRAP } from '@/modules/home/utils/classes';

const INSTALL = `git clone ${GITHUB_URL} && cd Quantum && bash scripts/deploy.sh`;

const LandingHero = () => (
    <section aria-labelledby='hero-title' className='relative pt-[clamp(3.5rem,8vw,6rem)]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 -top-15 h-[45rem] bg-[radial-gradient(60%_50%_at_50%_0%,var(--glow),transparent_70%)]' />

        <div className={`${WRAP} relative grid grid-cols-1 gap-5.5`}>
            <Link to='/get-started' className={`${EYEBROW} transition-colors hover:text-foreground motion-reduce:transition-none`}>
                <span className={`shrink-0 rounded-full bg-accent/15 px-2 py-px font-medium ${ACCENT_TEXT}`}>Self-hosted</span>
                <span className='truncate'>Runs on a Linux server with Docker</span>
                <ChevronRight aria-hidden='true' className='size-3.5 shrink-0 text-subtle' />
            </Link>

            <h1 id='hero-title' className={`${GRADIENT_TITLE} text-[length:clamp(2.5rem,7vw,4.75rem)] leading-[1.02] tracking-[-0.045em]`}>
                <span className='block'>Deploy anything.</span>{' '}
                <span className='block'>On a server you own.</span>
            </h1>

            <p className={LEDE}>
                Deploy GitHub repositories, databases, one-click templates and Docker Compose stacks on your own server, with logs, a shell,
                environment variables, persistent volumes, metrics and VS Code in the browser for every one of them.
            </p>

            <div className='flex flex-wrap items-center gap-2.5'>
                <Link to='/get-started' className={buttonVariants({ size: 'lg' })}>
                    Deploy Quantum
                    <ArrowRight aria-hidden='true' />
                </Link>

                <CommandChip command={INSTALL} />
            </div>

            <LandingShot />
        </div>
    </section>
);

export default LandingHero;
