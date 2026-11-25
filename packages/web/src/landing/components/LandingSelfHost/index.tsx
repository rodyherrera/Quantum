import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Band from '@/landing/components/Band';
import DitherField from '@/landing/components/DitherField';
import PixelLink from '@/landing/components/PixelLink';
import CommandBlock from '@/landing/components/CommandBlock';
import GuideText from '@/landing/components/GuideText';
import { GITHUB_URL } from '@/landing/utils/links';
import { FIELD, MONO_LABEL, MONO_TITLE } from '@/landing/utils/classes';

const COMMANDS = [`git clone ${GITHUB_URL}`, 'cd Quantum', 'bash scripts/deploy.sh'];

const LandingSelfHost = () => (
    <Band id='self-host' labelledBy='self-host-title'>
        <div className={`relative isolate overflow-hidden px-5 pb-14 pt-16 sm:px-12 sm:pb-16 sm:pt-24 ${FIELD}`}>
            <DitherField />

            <div className='relative grid max-w-[44rem] gap-5'>
                <p className={`${MONO_LABEL} text-white/70`}>
                    <span className='text-white'>03</span>
                    <span aria-hidden='true' className='mx-2'>/</span>
                    Self-host
                </p>

                <h2 id='self-host-title' className={`${MONO_TITLE} text-[length:clamp(1.5rem,3.6vw,2.625rem)] leading-[1.08] tracking-[-0.01em]`}>
                    Three containers and a .env file.
                </h2>

                <p className='max-w-[60ch] text-[0.9375rem] leading-[1.6] text-white/80'>
                    <GuideText text='The deploy script writes `.env` from `.env.example`, generates the secrets, builds the images and starts quantum-api, quantum-web and quantum-postgres. The dashboard answers on port 5050 and the API on 7080.' />
                </p>

                <div className='mt-3 max-w-[34rem]'>
                    <CommandBlock label='On a Linux machine with Docker' command={COMMANDS} />
                </div>

                <div className='mt-7 flex flex-wrap gap-4'>
                    <PixelLink to='/get-started'>
                        Open the guide
                        <ArrowRight aria-hidden='true' />
                    </PixelLink>
                    <PixelLink href={`${GITHUB_URL}#deploy-quantum`} tone='paper'>
                        Read the README
                        <ArrowUpRight aria-hidden='true' />
                    </PixelLink>
                </div>
            </div>
        </div>
    </Band>
);

export default LandingSelfHost;
