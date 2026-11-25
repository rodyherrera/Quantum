import { ArrowUpRight } from 'lucide-react';
import DitherField from '@/modules/home/components/DitherField';
import Crosshair from '@/modules/home/components/Crosshair';
import PixelLink from '@/modules/home/components/PixelLink';
import CommandChip from '@/modules/home/components/CommandChip';
import { GITHUB_URL } from '@/modules/home/utils/links';
import { FIELD, LEDE, MONO_LABEL, MONO_TITLE } from '@/modules/home/utils/classes';

const INSTALL = `git clone ${GITHUB_URL} && cd Quantum && bash scripts/deploy.sh`;

/* A frame 12px inside the viewport, with a + where its lines cross. */
const RULES = ['inset-x-0 top-3 h-px', 'inset-x-0 bottom-3 h-px', 'inset-y-0 left-3 w-px', 'inset-y-0 right-3 w-px'];
const CORNERS = ['left-3 top-3', 'right-3 top-3', 'bottom-3 left-3', 'bottom-3 right-3'];

const LandingHero = () => (
    <section aria-labelledby='hero-title' className={`relative isolate flex min-h-[max(40rem,100svh)] flex-col overflow-hidden ${FIELD}`}>
        <DitherField />

        {RULES.map((rule) => <span key={rule} aria-hidden='true' className={`absolute bg-white/20 ${rule}`} />)}
        {CORNERS.map((corner) => <Crosshair key={corner} className={`text-white/80 ${corner}`} />)}

        <div className='relative mx-auto flex w-full max-w-[62rem] flex-1 flex-col items-center justify-center px-7 pb-20 pt-32 text-center'>
            <p className={`${MONO_LABEL} text-white/70`}>Self-hosted · Open source</p>

            <h1 id='hero-title' className={`${MONO_TITLE} mt-7 text-[length:clamp(1.75rem,6.6vw,4.75rem)] leading-[1.06] tracking-[0.01em]`}>
                <span className='block'>Deploy anything.</span>{' '}
                <span className='block'>On a server you own.</span>
            </h1>

            <p className={`${LEDE} mt-6 text-white/80 [text-wrap:balance]`}>
                GitHub repositories, databases, one-click templates and Docker Compose stacks, with logs, a shell, metrics and
                VS Code in the browser for every one of them.
            </p>

            <div className='mt-11 flex flex-wrap justify-center gap-4'>
                <PixelLink to='/get-started'>Deploy Quantum</PixelLink>
                <PixelLink href={GITHUB_URL} tone='paper'>
                    View on GitHub
                    <ArrowUpRight aria-hidden='true' />
                </PixelLink>
            </div>

            <div className='mt-8 flex w-full justify-center'>
                <CommandChip command={INSTALL} />
            </div>
        </div>
    </section>
);

export default LandingHero;
