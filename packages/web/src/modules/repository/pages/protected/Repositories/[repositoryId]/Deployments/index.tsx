import { useEffect, useState } from 'react';
import { TableSkeleton } from '@/shared/components/skeletons';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Play, Rocket, RotateCw, Square } from 'lucide-react';
import ListPageShell from '@/shared/components/ListPageShell';
import EmptyState from '@/shared/components/EmptyState';
import CenterState from '@/shared/components/CenterState';
import InlineError from '@/shared/components/InlineError';
import DeleteConfirmDialog from '@/shared/components/DeleteConfirmDialog';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import DeploymentPipelinePanel from '@/modules/repository/components/DeploymentPipelinePanel';
import DeploymentsTable from '@/modules/repository/components/DeploymentsTable';
import { useQuery } from '@/shared/hooks/api/use-query';
import { useResource } from '@/shared/hooks/api/use-resource';
import { useMutation } from '@/shared/hooks/api/use-mutation';
import { useChannel } from '@/shared/hooks/socket/use-channel';
import { repositoryApi } from '@/modules/repository/api/api';
import { deploymentApi } from '@/modules/repository/api/deployment-api';
import { deploymentRoutes } from '@quantum/contracts/modules/deployment/routes';
import { activityApi } from '@/modules/activity/api/api';
import { isDeploymentInProgress } from '@/modules/repository/utils/deployment-status';
import { isContainerRunning } from '@/modules/application/utils/container-status';
import PublishedPorts from '@/modules/repository/components/PublishedPorts';
import { repositoryDetailErrorMessages } from '@/modules/repository/utils/error-messages';
import { errorCopy } from '@/shared/utils/error-copy';
import { RepositoryOperation } from '@quantum/contracts/modules/repository/domain';
import type { Deployment, DeploymentStatusFrame } from '@quantum/contracts/modules/deployment/domain';
import type { RepositoryOperationInput } from '@quantum/contracts/modules/deployment/http';
import type { Repository } from '@quantum/contracts/modules/repository/domain';
import type { ActivityEvent } from '@quantum/contracts/modules/activity/domain';

const copy = errorCopy(repositoryDetailErrorMessages);

const LOG_LINE_LIMIT = 200;

interface DeploymentsHeaderProps{
    repository: Repository;
    isOperating: boolean;
    onOperate: (operation: RepositoryOperation) => void;
}

const DeploymentsHeader = ({ repository, isOperating, onOperate }: DeploymentsHeaderProps) => {
    const isRunning = isContainerRunning(repository.containerStatus);

    return (
        <div className='flex flex-wrap items-end justify-between gap-4'>
            <div>
                <h2 className='text-[0.9375rem] font-medium text-foreground'>Deployments</h2>
                <p className='mt-1 text-[0.8125rem] text-muted'>Continuously generated from {repository.alias}.</p>
                <div className='mt-2'>
                    <PublishedPorts ports={repository.ports} />
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
                <Button
                    variant='secondary'
                    isDisabled={isRunning || isOperating}
                    onPress={() => onOperate(RepositoryOperation.Start)}
                >
                    <Play aria-hidden='true' className='size-4' />
                    Start
                </Button>
                <Button
                    variant='secondary'
                    isDisabled={!isRunning || isOperating}
                    onPress={() => onOperate(RepositoryOperation.Stop)}
                >
                    <Square aria-hidden='true' className='size-4' />
                    Stop
                </Button>
                <Button variant='secondary' isDisabled={isOperating} onPress={() => onOperate(RepositoryOperation.Restart)}>
                    <RotateCw aria-hidden='true' className='size-4' />
                    Restart
                </Button>
            </div>
        </div>
    );
};

interface RollbackDeploymentDialogProps{
    deployment: Deployment | null;
    onClose: () => void;
    onRolledBack: () => void;
}

const RollbackDeploymentDialog = ({ deployment, onClose, onRolledBack }: RollbackDeploymentDialogProps) => {
    const rollback = useMutation((repositoryId: number, deploymentId: number) =>
        repositoryApi.rollback({ path: { id: repositoryId, deploymentId } }));

    const handleConfirm = async () => {
        if(deployment === null) return;

        const rolledBack = await rollback
            .run(deployment.repositoryId, deployment.id)
            .then(() => true, () => false);
        if(!rolledBack) return;

        onClose();
        onRolledBack();
    };

    return (
        <ConfirmDialog
            isOpen={deployment !== null}
            onOpenChange={(isOpen) => { if(!isOpen) onClose(); }}
            title='Roll back deployment'
            description='This redeploys the artifact from this deployment, replacing the currently running version.'
            confirmLabel='Roll back'
            isPending={rollback.loading}
            error={copy(rollback.error)}
            onConfirm={() => { void handleConfirm(); }}
        />
    );
};

interface DeleteDeploymentDialogProps{
    deployment: Deployment | null;
    onClose: () => void;
    onDeleted: () => void;
}

const DeleteDeploymentDialog = ({ deployment, onClose, onDeleted }: DeleteDeploymentDialogProps) => (
    <DeleteConfirmDialog
        isOpen={deployment !== null}
        title='Delete deployment'
        description='This permanently deletes this deployment record. This action cannot be undone.'
        entityId={deployment?.id ?? null}
        remove={(id) => deploymentApi.remove({ path: { id } })}
        getErrorMessage={copy}
        onClose={onClose}
        onRemoved={onDeleted}
    />
);

const Deployments = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    const id = repositoryId !== undefined ? Number(repositoryId) : undefined;
    const [searchParams, setSearchParams] = useSearchParams();

    const repository = useQuery((repositoryId: number) => repositoryApi.get({ path: { id: repositoryId } }), [id]);
    const deploymentsQuery = useResource(deploymentRoutes, {
        list: 'listByRepository',
        request: id === undefined ? null : { path: { repositoryId: id } }
    });

    const [activeJobId, setActiveJobId] = useState<string | null>(() => searchParams.get('job'));
    const [pipelineDone, setPipelineDone] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [steps, setSteps] = useState<ActivityEvent[]>([]);
    const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Deployment | null>(null);

    const operate = useMutation((repositoryOperationId: number, body: RepositoryOperationInput) =>
        deploymentApi.operate({ path: { repositoryId: repositoryOperationId }, body }));

    const handleOperate = async (operation: RepositoryOperation) => {
        if(id === undefined) return;

        const accepted = await operate.run(id, { operation }).then((result) => result, () => null);
        if(accepted === null) return;

        setActiveJobId(String(accepted.jobId));
        setPipelineDone(false);
        setLogs([]);
    };

    const handleStatusFrame = (frame: DeploymentStatusFrame) => {
        deploymentsQuery.refresh();
        if(!isDeploymentInProgress(frame.status)) setPipelineDone(true);
    };

    const deploymentChannel = useChannel('/deployment/stream', {
        'deployment.statusChanged': handleStatusFrame,
        'deployment.completed': handleStatusFrame,
        'deployment.log': (frame) => setLogs((previous) => [...previous, frame.line].slice(-LOG_LINE_LIMIT))
    });

    useEffect(() => {
        if(id === undefined) return;
        if(deploymentChannel.status !== 'open') return;
        deploymentChannel.send('subscribe', { repositoryId: id });
    }, [id, deploymentChannel]);

    const stepsQuery = useQuery(
        (query: { correlationId?: string; minutes?: number }) => activityApi.list({ query }),
        [activeJobId !== null ? { correlationId: activeJobId } : undefined],
        { enabled: activeJobId !== null }
    );

    useEffect(() => {
        setSteps([]);
    }, [activeJobId]);

    useEffect(() => {
        if(stepsQuery.data) setSteps(stepsQuery.data.items);
    }, [stepsQuery.data]);

    const activityChannel = useChannel('/activity/stream', {
        'activity.created': (event) => {
            if(event.correlationId === activeJobId) setSteps((previous) => [...previous, event]);
        }
    });

    useEffect(() => {
        if(activityChannel.status === 'open') activityChannel.send('subscribe', {});
    }, [activityChannel]);

    const handleDismiss = () => {
        setActiveJobId(null);
        setSearchParams((previous) => {
            if(!previous.has('job')) return previous;
            const next = new URLSearchParams(previous);
            next.delete('job');
            return next;
        }, { replace: true });
    };

    if(id === undefined || repository.loading || deploymentsQuery.loading || repository.error !== undefined || deploymentsQuery.error !== undefined){
        const failedRepository = id !== undefined && repository.error !== undefined;

        return (
            <ListPageShell
                fill
                loading={id === undefined || repository.loading || deploymentsQuery.loading}
                skeleton={<TableSkeleton columns={5} />}
                error={id === undefined ? undefined : repository.error ?? deploymentsQuery.error}
                errorTitle={failedRepository ? 'Could not load repository' : 'Could not load deployments'}
                getErrorDescription={copy}
                onRetry={failedRepository ? repository.reload : deploymentsQuery.refresh}
            />
        );
    }
    if(repository.data === null) return null;

    const deployments = deploymentsQuery.data ?? [];

    return (
        <div className='flex min-h-0 flex-1 flex-col'>
            <DeploymentsHeader
                repository={repository.data}
                isOperating={operate.loading}
                onOperate={(operation) => { void handleOperate(operation); }}
            />

            {operate.error !== undefined && <InlineError className='mt-4'>{copy(operate.error)}</InlineError>}

            {activeJobId && (
                <DeploymentPipelinePanel steps={steps} logs={logs} done={pipelineDone} onDismiss={handleDismiss} />
            )}

            <div className='mt-6 flex flex-1 flex-col'>
                {deployments.length === 0 ? (
                    !activeJobId && (
                        <CenterState>
                            <EmptyState
                                icon={Rocket}
                                title='No deployments yet'
                                description='Start this application to create its first deployment.'
                            />
                        </CenterState>
                    )
                ) : (
                    <DeploymentsTable deployments={deployments} onRollback={setRollbackTarget} onDelete={setDeleteTarget} />
                )}
            </div>

            <RollbackDeploymentDialog
                deployment={rollbackTarget}
                onClose={() => setRollbackTarget(null)}
                onRolledBack={deploymentsQuery.refresh}
            />

            <DeleteDeploymentDialog
                deployment={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={deploymentsQuery.refresh}
            />
        </div>
    );
};

export default Deployments;
