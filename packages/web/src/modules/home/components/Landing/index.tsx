import LandingShell from '@/modules/home/components/LandingShell';
import LandingHero from '@/modules/home/components/LandingHero';
import LandingShot from '@/modules/home/components/LandingShot';
import LandingDeploy from '@/modules/home/components/LandingDeploy';
import LandingOperate from '@/modules/home/components/LandingOperate';
import LandingSelfHost from '@/modules/home/components/LandingSelfHost';

const Landing = () => (
    <LandingShell overlay>
        <LandingHero />
        <LandingShot />
        <LandingDeploy />
        <LandingOperate />
        <LandingSelfHost />
    </LandingShell>
);

export default Landing;
