import Band from '@/modules/home/components/Band';
import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingDashboard from '@/modules/home/components/LandingDashboard';

const LandingShot = () => (
    <Band label='The dashboard' className='p-3 sm:p-6'>
        <div className='relative overflow-hidden border border-border bg-canvas'>
            <div className='max-md:w-[180%]'>
                <LandingSheet title='The Applications page of a Quantum dashboard' width={1280} height={600} path='/applications'>
                    <LandingDashboard />
                </LandingSheet>
            </div>

            <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-background' />
        </div>
    </Band>
);

export default LandingShot;
