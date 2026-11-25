import { In } from 'typeorm';
import DockerContainer from '@/modules/docker/models/DockerContainer';
import PortBinding from '@/modules/docker/models/PortBinding';
import Deployment from '../../models/Deployment';
import Job from '../../models/Job';
import ContainerOps from '../ContainerOps';
import { ensureEdge } from '../Edge';
import { clearLeftovers } from '../Release';
import { getDockerHost } from '../DockerHost';
import { ContainerDesiredState, ContainerStatus } from '@quantum/contracts/modules/docker/domain';
import { DeploymentStatus, JobStatus, JobType } from '@quantum/contracts/modules/deployment/domain';
import { logger } from '@/shared/utils/Logger';

const DEPLOY_LOCKING_JOB_TYPES: JobType[] = [
    JobType.Deploy, JobType.Redeploy, JobType.Build, JobType.Reload,
    JobType.Start, JobType.Stop, JobType.Restart
];

export default class ReconcileHandler{

    async run(): Promise<void>{
        const desired = await DockerContainer.find();
        const actualNames = await this.#actualNames();

        let recreated = 0;
        let started = 0;
        let skipped = 0;
        for(const container of desired){
            const outcome = await this.#reconcileOne(container, actualNames);
            if(outcome === 'recreated') recreated++;
            else if(outcome === 'started') started++;
            else skipped++;
        }
        logger.info(`reconciled — recreated ${recreated}, started ${started}, skipped ${skipped}, total ${desired.length}`, { scope: 'orchestrator.handler.reconcile' });
    }

    async #actualNames(): Promise<Set<string>>{
        try{
            const actual = await getDockerHost().listContainers({ all: true });
            return new Set(actual.flatMap((entry) => (entry.Names || []).map((name) => name.replace(/^\//, ''))));
        }catch(error){
            logger.error('reconcile: cannot list containers', error, { scope: 'orchestrator.handler.reconcile' });
            throw error;
        }
    }

    async #reconcileOne(container: DockerContainer, actualNames: Set<string>): Promise<'recreated' | 'started' | 'skipped'>{
        if(container.desiredState === ContainerDesiredState.Stopped) return 'skipped';
        if(container.repositoryId && await this.#hasInFlightDeploy(container.repositoryId)) return 'skipped';

        const present = container.dockerContainerName ? actualNames.has(container.dockerContainerName) : false;
        const ops = new ContainerOps(container);
        try{
            if(!present){
                await this.#recreate(ops, container);
                return 'recreated';
            }
            if(await this.#portsDrifted(ops, container)) return await this.#replace(ops, container);
            if(container.status !== ContainerStatus.Running) return await this.#startOrRecreate(ops, container);
            await ops.ensureAddress();
            if(container.isRepositoryContainer){
                await clearLeftovers(container);
                await ensureEdge(container);
            }
            return 'started';
        }catch(error){
            logger.error(`reconcile failed for ${container.dockerContainerName}`, error, { scope: 'orchestrator.handler.reconcile' });
            return 'skipped';
        }
    }

    async #startOrRecreate(ops: ContainerOps, container: DockerContainer): Promise<'started' | 'recreated'>{
        try{
            await ops.start();
            return 'started';
        }catch(error){
            logger.warn(
                `reconcile: ${container.dockerContainerName} could not start, recreating it — ${(error as Error).message}`,
                { scope: 'orchestrator.handler.reconcile' }
            );
            return await this.#replace(ops, container);
        }
    }

    async #portsDrifted(ops: ContainerOps, container: DockerContainer): Promise<boolean>{
        const bindings = await PortBinding.find({ where: { containerId: container.id } });
        const wanted = new Set(bindings.map((binding) => binding.externalPort));
        const published = await ops.publishedPorts();
        // A repository app hands its ports to its edge, which keeps them in line on its own.
        if(container.isRepositoryContainer && published.size === 0) return false;

        if(wanted.size !== published.size) return true;
        return [...wanted].some((port) => !published.has(port));
    }

    async #replace(ops: ContainerOps, container: DockerContainer): Promise<'recreated'>{
        await ops.destroyContainer();
        await this.#recreate(ops, container);
        return 'recreated';
    }

    async #recreate(ops: ContainerOps, container: DockerContainer): Promise<void>{
        let imageOverride: string | undefined;
        if(container.repositoryId){
            imageOverride = await this.#lastSuccessTag(container.repositoryId);
        }
        await ops.createAndStartContainer({ imageOverride });
        await ops.relaunchRepositoryApp();
    }

    async #hasInFlightDeploy(repositoryId: number): Promise<boolean>{
        const count = await Job.countBy({
            repositoryId,
            type: In(DEPLOY_LOCKING_JOB_TYPES),
            status: In([JobStatus.Active, JobStatus.Queued, JobStatus.Delayed])
        });
        return count > 0;
    }

    async #lastSuccessTag(repositoryId: number): Promise<string | undefined>{
        const last = await Deployment.findOne({
            where: { repositoryId, status: DeploymentStatus.Success },
            order: { createdAt: 'DESC', id: 'DESC' }
        });
        return last?.artifact?.tag || undefined;
    }
}
