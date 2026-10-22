import DeploymentSteps from '@/modules/template/components/DeploymentSteps';
import { LinesSkeleton } from '@/shared/components/skeletons';
import { useQuery } from '@/shared/hooks/api/use-query';
import { usePolledQuery } from '@/shared/hooks/api/use-polled-query';
import { templateInstallApi } from '@/modules/template/api/api';
import { latestRun } from '@/modules/template/utils/deployment-run';

const POLL_MS = 2500;

interface DeploymentProgressProps{
    installId: number;
    active: boolean;
}

const DeploymentProgress = ({ installId, active }: DeploymentProgressProps) => {
    const activity = usePolledQuery(
        useQuery((id: number) => templateInstallApi.activity({ path: { id } }), [installId]),
        { while: () => active, everyMs: POLL_MS }
    );

    if(activity.loading && activity.data === null) return <LinesSkeleton lines={3} />;

    const steps = latestRun(activity.data ?? []);
    if(steps.length === 0) return null;

    return <DeploymentSteps steps={steps} />;
};

export default DeploymentProgress;
