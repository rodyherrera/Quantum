import PageBody from '@/shared/components/layout/PageBody';
import DeploymentPipelinePanel from '@/modules/repository/components/DeploymentPipelinePanel';
import DeploymentsTable from '@/modules/repository/components/DeploymentsTable';
import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingWindow from '@/modules/home/components/LandingWindow';
import { useStepRun } from '@/modules/home/hooks/use-step-run';
import { REPOSITORY_RUN } from '@/modules/home/utils/demo/activity';
import { DEMO_BUILD_LOGS, demoDeployments } from '@/modules/home/utils/demo/deployments';
import { IDLE } from '@/modules/home/utils/demo/idle';

interface DeployRepositoryProps{
    isActive: boolean;
}

const DeployRepository = ({ isActive }: DeployRepositoryProps) => {
    const run = useStepRun(REPOSITORY_RUN, isActive);

    return (
        <LandingWindow title='storefront · Deployments'>
            <LandingSheet title='Deployments of a repository' width={1040} height={640} path='/repositories/12/deployments'>
                <PageBody width='wide' height='full'>
                    <h2 className='text-[0.9375rem] font-medium text-foreground'>Deployments</h2>
                    <p className='mt-1 text-[0.8125rem] text-muted'>Continuously generated from acme/storefront.</p>

                    <DeploymentPipelinePanel steps={run.steps} logs={DEMO_BUILD_LOGS} done={run.done} onDismiss={IDLE} />

                    <div className='mt-6'>
                        <DeploymentsTable deployments={demoDeployments(run.done)} onRollback={IDLE} onDelete={IDLE} />
                    </div>
                </PageBody>
            </LandingSheet>
        </LandingWindow>
    );
};

export default DeployRepository;
