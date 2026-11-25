import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Band from '@/landing/components/Band';
import DitherField from '@/landing/components/DitherField';
import PixelLink from '@/landing/components/PixelLink';
import CommandBlock from '@/landing/components/CommandBlock';
import { GITHUB_URL } from '@/landing/utils/links';
import { FIELD, MONO_LABEL } from '@/landing/utils/classes';

const COMMANDS = [`git clone ${GITHUB_URL}`, 'cd Quantum', 'bash scripts/deploy.sh'];

const LandingSelfHost = () => (
    <Band id='self-host' label='Self-host'>
        <div className={`relative isolate overflow-hidden px-5 pb-14 pt-16 sm:px-12 sm:pb-16 sm:pt-24 ${FIELD}`}>
            <DitherField />

            <div className='relative grid max-w-[44rem] gap-5'>
                <p className={`${MONO_LABEL} text-white/70`}>Self-host</p>

                <div className='max-w-[34rem]'>
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
