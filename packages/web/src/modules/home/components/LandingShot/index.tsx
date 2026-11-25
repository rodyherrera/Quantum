import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingDashboard from '@/modules/home/components/LandingDashboard';

const LandingShot = () => (
    <div className='relative mt-10 overflow-hidden rounded-[0.875rem] border border-border bg-canvas shadow-[0_40px_120px_-20px_var(--glow),var(--overlay-shadow)] sm:mt-16'>
        <div className='max-md:w-[180%]'>
            <LandingSheet title='The Applications page of a Quantum dashboard' width={1280} height={600} path='/applications'>
                <LandingDashboard />
            </LandingSheet>
        </div>

        <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-background' />
    </div>
);

export default LandingShot;
