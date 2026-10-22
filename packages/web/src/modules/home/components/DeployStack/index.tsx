import PageBody from '@/shared/components/layout/PageBody';
import DeploymentSteps from '@/modules/template/components/DeploymentSteps';
import ServicesTable from '@/modules/template/components/ServicesTable';
import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingWindow from '@/modules/home/components/LandingWindow';
import { useStepRun } from '@/modules/home/hooks/use-step-run';
import { STACK_RUN } from '@/modules/home/utils/demo/activity';
import { STACK_SERVICES } from '@/modules/home/utils/demo/applications';
import { DEMO_HOST } from '@/modules/home/utils/demo/entities';

interface DeployStackProps{
    isActive: boolean;
}

const DeployStack = ({ isActive }: DeployStackProps) => {
    const run = useStepRun(STACK_RUN, isActive);

    return (
        <LandingWindow title='shop · Services'>
            <LandingSheet title='A Compose stack deploying from a repository' width={1200} height={740} path='/installs/9/services'>
                <PageBody width='wide' height='full'>
                    <div className='grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start gap-14'>
                        <ServicesTable host={DEMO_HOST} services={STACK_SERVICES} />
                        <DeploymentSteps steps={run.steps} />
                    </div>
                </PageBody>
            </LandingSheet>
        </LandingWindow>
    );
};

export default DeployStack;
