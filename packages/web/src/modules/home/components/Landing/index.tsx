import LandingShell from '@/modules/home/components/LandingShell';
import LandingHero from '@/modules/home/components/LandingHero';
import LandingCatalogue from '@/modules/home/components/LandingCatalogue';
import LandingDeploy from '@/modules/home/components/LandingDeploy';
import LandingOperate from '@/modules/home/components/LandingOperate';
import LandingSelfHost from '@/modules/home/components/LandingSelfHost';
import LandingClosing from '@/modules/home/components/LandingClosing';

const Landing = () => (
    <LandingShell>
        <LandingHero />
        <LandingCatalogue />
        <LandingDeploy />
        <LandingOperate />
        <LandingSelfHost />
        <LandingClosing />
    </LandingShell>
);

export default Landing;
