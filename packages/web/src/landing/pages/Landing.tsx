import LandingShell from '@/landing/components/LandingShell';
import LandingHero from '@/landing/components/LandingHero';
import LandingShot from '@/landing/components/LandingShot';
import LandingDeploy from '@/landing/components/LandingDeploy';
import LandingOperate from '@/landing/components/LandingOperate';
import LandingSelfHost from '@/landing/components/LandingSelfHost';

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
