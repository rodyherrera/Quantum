import PageBody from '@/shared/components/layout/PageBody';
import ApplicationsTable from '@/modules/application/components/ApplicationsTable';
import ConnectionStringField from '@/modules/database/components/ConnectionStringField';
import DeploymentSteps from '@/modules/template/components/DeploymentSteps';
import LandingSheet from '@/modules/home/components/LandingSheet';
import LandingWindow from '@/modules/home/components/LandingWindow';
import { useStepRun } from '@/modules/home/hooks/use-step-run';
import { DATABASE_RUN } from '@/modules/home/utils/demo/activity';
import { DEMO_CONNECTION_STRING, databaseRows } from '@/modules/home/utils/demo/applications';
import { IDLE_ROW_ACTIONS } from '@/modules/home/utils/demo/idle';
import { DatabaseStatus } from '@quantum/contracts/modules/database/domain';

interface DeployDatabaseProps{
    isActive: boolean;
}

const DeployDatabase = ({ isActive }: DeployDatabaseProps) => {
    const run = useStepRun(DATABASE_RUN, isActive);

    return (
        <LandingWindow title='orders · PostgreSQL 16'>
            <LandingSheet title='A database being provisioned' width={1040} height={640} path='/applications'>
                <PageBody width='wide' height='full'>
                    <div className='grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start gap-x-14 gap-y-10'>
                        <DeploymentSteps steps={run.steps} />
                        <ConnectionStringField value={DEMO_CONNECTION_STRING} />

                        <div className='col-span-2'>
                            <ApplicationsTable rows={databaseRows(run.done ? DatabaseStatus.Running : DatabaseStatus.Provisioning)} {...IDLE_ROW_ACTIONS} />
                        </div>
                    </div>
                </PageBody>
            </LandingSheet>
        </LandingWindow>
    );
};

export default DeployDatabase;
