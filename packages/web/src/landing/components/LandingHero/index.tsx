import { ArrowUpRight } from 'lucide-react';
import DitherField from '@/landing/components/DitherField';
import Crosshair from '@/landing/components/Crosshair';
import PixelLink from '@/landing/components/PixelLink';
import CommandChip from '@/landing/components/CommandChip';
import { GITHUB_URL } from '@/landing/utils/links';
import { FIELD, MONO_TITLE } from '@/landing/utils/classes';

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
            <h1 id='hero-title' className={`${MONO_TITLE} text-[length:clamp(1.75rem,6.6vw,4.75rem)] leading-[1.06] tracking-[0.01em]`}>
                <span className='block'>Deploy anything.</span>{' '}
                <span className='block'>On a server you own.</span>
            </h1>

            <div className='mt-12 flex flex-wrap justify-center gap-4'>
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
